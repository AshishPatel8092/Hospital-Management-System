require("dns").setDefaultResultOrder("ipv4first");
const nodemailer = require("nodemailer");
const express = require("express");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const pool = require("../db");

const router = express.Router();

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function deliverCode(email, purpose, code) {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    await transporter.sendMail({
      from: `"Casto Health Care" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Casto Health - ${purpose}`,
      html: `<div style="font-family:sans-serif; padding:20px; border:1px solid #eee;">
               <h2>Casto Health Care</h2><p>Your ${purpose} code is: <h1 style="color:#0f766e;">${code}</h1></p></div>`,
    });
    console.log(`[EMAIL SENT] Success: ${purpose} to ${email}`);
  } catch (error) {
    console.error(`[EMAIL ERROR]:`, error);
  }
}

const CODE_TTL_MS = 10 * 60 * 1000;
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 15 });
const registerLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10 });

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
  const table = user.role === "PATIENT" ? "patients" : "doctors";
  const idCol = user.role === "PATIENT" ? "patient_id" : "doctor_id";
  const [rows] = await pool.execute(
    `SELECT ${idCol} FROM ${table} WHERE user_id = ?`,
    [user.user_id],
  );
  return rows[0] ? rows[0][idCol] : null;
}

router.post("/register", registerLimiter, async (req, res) => {
  const { role = "PATIENT", fullName, email, password, phone } = req.body;
  if (!fullName || !email || !password)
    return res.status(400).json({ success: false, message: "Missing fields." });
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.execute(
      "SELECT user_id FROM users WHERE email = ?",
      [email],
    );
    if (existing.length > 0)
      return res
        .status(409)
        .json({ success: false, message: "Email already exists." });
    const passwordHash = await bcrypt.hash(password, 12);
    const code = generateCode();
    const expires = new Date(Date.now() + CODE_TTL_MS);
    await connection.beginTransaction();
    const [userResult] = await connection.execute(
      `INSERT INTO users (full_name, email, password_hash, role, phone, email_verified, verification_code, verification_expires) VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
      [
        fullName,
        email,
        passwordHash,
        role.toUpperCase(),
        phone || null,
        code,
        expires,
      ],
    );
    const userId = userResult.insertId;
    if (role.toUpperCase() === "PATIENT") {
      await connection.execute(
        `INSERT INTO patients (user_id, first_name) VALUES (?, ?)`,
        [userId, fullName],
      );
    } else {
      await connection.execute(
        `INSERT INTO doctors (user_id, first_name) VALUES (?, ?)`,
        [userId, fullName],
      );
    }
    await connection.commit();
    await deliverCode(email, "Email Verification", code);
    res.status(201).json({
      success: true,
      message: "Check your email for the code.",
      data: { requiresVerification: true, email },
    });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    connection.release();
  }
});

router.post("/verify-email", async (req, res) => {
  const { email, code } = req.body;
  try {
    const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    const user = rows[0];
    if (!user || user.verification_code !== code)
      return res.status(400).json({ success: false, message: "Invalid code." });
    await pool.execute(
      "UPDATE users SET email_verified = 1, verification_code = NULL WHERE user_id = ?",
      [user.user_id],
    );
    res.json({
      success: true,
      message: "Email verified! You can now sign in.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await pool.execute(
      "SELECT * FROM users WHERE email = ? AND is_active = 1",
      [email],
    );
    const user = users[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });
    if (!user.email_verified)
      return res.status(403).json({
        success: false,
        message: "Please verify your email first.",
        data: { requiresVerification: true, email },
      });

    const twofaCode = generateCode();
    await pool.execute(
      "UPDATE users SET twofa_code = ?, twofa_expires = ? WHERE user_id = ?",
      [twofaCode, new Date(Date.now() + CODE_TTL_MS), user.user_id],
    );
    await deliverCode(email, "Login 2FA", twofaCode);
    res.json({
      success: true,
      message: "Enter the 2FA code sent to your email.",
      data: { requiresTwoFactor: true, email },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/verify-login-otp", async (req, res) => {
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
    await pool.execute("UPDATE users SET twofa_code = NULL WHERE user_id = ?", [
      user.user_id,
    ]);
    const linkedId = await findLinkedId(user);
    establishSession(req, user, linkedId, (err, sessionUser) => {
      if (err)
        return res
          .status(500)
          .json({ success: false, message: "Session error." });
      res.json({ success: true, message: "Welcome back!", data: sessionUser });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/me", (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ success: false, message: "Not logged in." });
  res.json({ success: true, data: req.session.user });
});

module.exports = router;
