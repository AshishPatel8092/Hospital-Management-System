require("dns").setDefaultResultOrder("ipv4first"); // Force IPv4 to fix ENETUNREACH
const nodemailer = require("nodemailer");
const express = require("express");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const pool = require("../db");

const router = express.Router();

// --- UTILITY FUNCTIONS ---

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
}

async function deliverCode(email, purpose, code) {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Casto Health Care" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Casto Health - ${purpose}`,
      text: `Your 6-digit verification code is: ${code}. This code expires in 10 minutes.`,
      html: `<div style="font-family: sans-serif; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
               <h2>Casto Health Care</h2>
               <p>Hello,</p>
               <p>Your <strong>${purpose}</strong> verification code is:</p>
               <h1 style="color: #008080; letter-spacing: 5px;">${code}</h1>
               <p>This code will expire in 10 minutes.</p>
             </div>`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SENT] Success: ${purpose} code sent to ${email}`);
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send email to ${email}:`, error);
  }
}

const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
const STRONG_PASSWORD =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

function passwordStrengthError(password) {
  if (!password || password.length < 8)
    return "Password must be at least 8 characters.";
  if (!STRONG_PASSWORD.test(password)) {
    return "Password must include an uppercase letter, a lowercase letter, a number, and a special character.";
  }
  return null;
}

// --- RATE LIMITERS ---
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { success: false, message: "Too many login attempts." },
});
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many registration attempts." },
});
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 8,
  message: { success: false, message: "Too many reset attempts." },
});

function establishSession(req, user, linkedId, callback) {
  req.session.regenerate((err) => {
    if (err) return callback(err);
    req.session.user = {
      userId: user.user_id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      linkedId,
    };
    callback(null, req.session.user);
  });
}

async function findLinkedId(user) {
  if (user.role === "PATIENT") {
    const [rows] = await pool.execute(
      "SELECT patient_id FROM patients WHERE user_id = ?",
      [user.user_id],
    );
    return rows[0] ? rows[0].patient_id : null;
  }
  if (user.role === "DOCTOR") {
    const [rows] = await pool.execute(
      "SELECT doctor_id FROM doctors WHERE user_id = ?",
      [user.user_id],
    );
    return rows[0] ? rows[0].doctor_id : null;
  }
  return null;
}

// --- ROUTES ---

router.post("/register", registerLimiter, async (req, res) => {
  const { role = "PATIENT", fullName, email, password, phone } = req.body;
  if (!fullName || !email || !password)
    return res.status(400).json({
      success: false,
      message: "fullName, email and password are required.",
    });
  const pwError = passwordStrengthError(password);
  if (pwError)
    return res.status(400).json({ success: false, message: pwError });
  const upperRole = role.toUpperCase();
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.execute(
      "SELECT user_id FROM users WHERE email = ?",
      [email],
    );
    if (existing.length > 0)
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    const passwordHash = await bcrypt.hash(password, 12);
    const verificationCode = generateCode();
    const verificationExpires = new Date(Date.now() + CODE_TTL_MS);
    await connection.beginTransaction();
    const [userResult] = await connection.execute(
      `INSERT INTO users (full_name, email, password_hash, role, phone, email_verified, verification_code, verification_expires)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
      [
        fullName,
        email,
        passwordHash,
        upperRole,
        phone || null,
        verificationCode,
        verificationExpires,
      ],
    );
    const userId = userResult.insertId;
    if (upperRole === "PATIENT") {
      const {
        firstName = fullName,
        lastName = "",
        gender,
        dob,
        bloodGroup,
        guardianName,
        address,
        country,
        medicalHistory,
        smokingStatus,
        alcoholStatus,
      } = req.body;
      await connection.execute(
        `INSERT INTO patients (user_id, first_name, last_name, gender, dob, blood_group, guardian_name, address, country, medical_history, smoking_status, alcohol_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          firstName,
          lastName,
          gender || null,
          dob || null,
          bloodGroup || null,
          guardianName || null,
          address || null,
          country || null,
          medicalHistory || null,
          smokingStatus || null,
          alcoholStatus || null,
        ],
      );
    } else if (upperRole === "DOCTOR") {
      const {
        firstName = fullName,
        lastName = "",
        department,
        specialization,
        gender,
        qualifications,
        experienceYears,
        consultationFee,
        clinicLocation,
        bio,
      } = req.body;
      await connection.execute(
        `INSERT INTO doctors (user_id, first_name, last_name, department, specialization, gender, qualifications, experience_years, consultation_fee, clinic_location, bio)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          firstName,
          lastName,
          department || null,
          specialization || null,
          gender || null,
          qualifications || null,
          experienceYears || null,
          consultationFee || null,
          clinicLocation || null,
          bio || null,
        ],
      );
    }
    await connection.commit();
    await deliverCode(email, "Email verification", verificationCode);
    res.status(201).json({
      success: true,
      message:
        "Account created. Please check your email to verify your account.",
      data: { requiresVerification: true, email },
    });
  } catch (err) {
    await connection.rollback();
    res
      .status(500)
      .json({ success: false, message: "Registration failed: " + err.message });
  } finally {
    connection.release();
  }
});

router.post("/verify-email", registerLimiter, async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code)
    return res
      .status(400)
      .json({ success: false, message: "Email and code are required." });
  try {
    const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    const user = rows[0];
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Account not found." });
    if (user.email_verified)
      return res
        .status(400)
        .json({ success: false, message: "Account already verified." });
    if (user.verification_code !== code)
      return res
        .status(400)
        .json({ success: false, message: "Incorrect code." });
    if (new Date(user.verification_expires) < new Date())
      return res.status(400).json({ success: false, message: "Code expired." });
    await pool.execute(
      "UPDATE users SET email_verified = 1, verification_code = NULL, verification_expires = NULL WHERE user_id = ?",
      [user.user_id],
    );
    res.json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error: " + err.message });
  }
});

router.post("/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required." });
  try {
    const [users] = await pool.execute(
      "SELECT * FROM users WHERE email = ? AND is_active = 1",
      [email],
    );
    const user = users[0];
    if (
      user &&
      user.lockout_until &&
      new Date(user.lockout_until) > new Date()
    ) {
      return res.status(423).json({
        success: false,
        message: "Too many attempts. Account locked temporarily.",
      });
    }
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      if (user) {
        const attempts = user.failed_login_attempts + 1;
        const lockout =
          attempts >= MAX_FAILED_LOGINS
            ? new Date(Date.now() + LOCKOUT_MS)
            : null;
        await pool.execute(
          "UPDATE users SET failed_login_attempts = ?, lockout_until = ? WHERE user_id = ?",
          [lockout ? 0 : attempts, lockout, user.user_id],
        );
      }
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }
    await pool.execute(
      "UPDATE users SET failed_login_attempts = 0, lockout_until = NULL WHERE user_id = ?",
      [user.user_id],
    );
    if (!user.email_verified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
        data: { requiresVerification: true, email },
      });
    }
    const twofaCode = generateCode();
    const twofaExpires = new Date(Date.now() + CODE_TTL_MS);
    await pool.execute(
      "UPDATE users SET twofa_code = ?, twofa_expires = ? WHERE user_id = ?",
      [twofaCode, twofaExpires, user.user_id],
    );
    await deliverCode(email, "Login verification (2FA)", twofaCode);
    res.json({
      success: true,
      message: "Enter the verification code sent to your email.",
      data: { requiresTwoFactor: true, email },
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Database error: " + err.message });
  }
});

router.post("/verify-login-otp", loginLimiter, async (req, res) => {
  const { email, code } = req.body;
  try {
    const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    const user = rows[0];
    if (!user || user.twofa_code !== code)
      return res
        .status(401)
        .json({ success: false, message: "Incorrect code." });
    if (new Date(user.twofa_expires) < new Date())
      return res.status(401).json({ success: false, message: "Code expired." });
    await pool.execute(
      "UPDATE users SET twofa_code = NULL, twofa_expires = NULL WHERE user_id = ?",
      [user.user_id],
    );
    const linkedId = await findLinkedId(user);
    establishSession(req, user, linkedId, (err, sessionUser) => {
      if (err)
        return res
          .status(500)
          .json({ success: false, message: "Session failed." });
      res.json({
        success: true,
        message: "Login successful.",
        data: sessionUser,
      });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error: " + err.message });
  }
});

router.post("/forgot-password", resetLimiter, async (req, res) => {
  const { email } = req.body;
  try {
    const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    const user = rows[0];
    if (!user)
      return res.json({
        success: true,
        message: "If that email is registered, a reset code has been sent.",
      });
    const resetCode = generateCode();
    const resetExpires = new Date(Date.now() + CODE_TTL_MS);
    await pool.execute(
      "UPDATE users SET reset_code = ?, reset_expires = ? WHERE user_id = ?",
      [resetCode, resetExpires, user.user_id],
    );
    await deliverCode(email, "Password reset", resetCode);
    res.json({ success: true, message: "Reset code sent to your email." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error: " + err.message });
  }
});

router.post("/reset-password", resetLimiter, async (req, res) => {
  const { email, code, newPassword } = req.body;
  const pwError = passwordStrengthError(newPassword);
  if (pwError)
    return res.status(400).json({ success: false, message: pwError });
  try {
    const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    const user = rows[0];
    if (!user || user.reset_code !== code)
      return res
        .status(400)
        .json({ success: false, message: "Incorrect code." });
    if (new Date(user.reset_expires) < new Date())
      return res.status(400).json({ success: false, message: "Code expired." });
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await pool.execute(
      "UPDATE users SET password_hash = ?, reset_code = NULL, reset_expires = NULL, failed_login_attempts = 0, lockout_until = NULL WHERE user_id = ?",
      [passwordHash, user.user_id],
    );
    res.json({
      success: true,
      message: "Password updated. You can now log in.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error: " + err.message });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ success: true, message: "Logged out." });
  });
});

router.get("/me", (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ success: false, message: "Not logged in." });
  res.json({ success: true, message: "OK", data: req.session.user });
});

module.exports = router;
