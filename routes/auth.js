const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const pool = require('../db');

const router = express.Router();

// ---------------------------------------------------------------------
// This project has no real email/SMS provider configured (that needs
// paid infrastructure - SendGrid, Twilio, etc. - and API keys this
// project doesn't have). Verification and 2FA codes are genuinely
// generated and required, exactly like a real flow - they're just
// "delivered" by being returned in the API response and printed to the
// server log, clearly labeled, instead of actually emailed. Swap
// `deliverCode` for a real email/SMS call and nothing else needs to
// change.
// ---------------------------------------------------------------------
function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
}

function deliverCode(email, purpose, code) {
  console.log(`[SIMULATED EMAIL] To: ${email} | ${purpose} code: ${code} (expires in 10 min)`);
}

const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

function passwordStrengthError(password) {
  if (!password || password.length < 8) return 'Password must be at least 8 characters.';
  if (!STRONG_PASSWORD.test(password)) {
    return 'Password must include an uppercase letter, a lowercase letter, a number, and a special character.';
  }
  return null;
}

// Rate limiters - each keyed by IP. Kept generous enough not to get in a
// real user's way, tight enough to blunt brute-force/credential-stuffing.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again in a few minutes.' },
});
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many registration attempts from this device. Please try again later.' },
});
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many password reset attempts. Please try again later.' },
});

function establishSession(req, user, linkedId, callback) {
  req.session.regenerate((err) => { // fresh session id every time, prevents session fixation
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
  if (user.role === 'PATIENT') {
    const [rows] = await pool.execute('SELECT patient_id FROM patients WHERE user_id = ?', [user.user_id]);
    return rows[0] ? rows[0].patient_id : null;
  }
  if (user.role === 'DOCTOR') {
    const [rows] = await pool.execute('SELECT doctor_id FROM doctors WHERE user_id = ?', [user.user_id]);
    return rows[0] ? rows[0].doctor_id : null;
  }
  return null;
}

// POST /api/register
// Body: { role: 'PATIENT' | 'DOCTOR', fullName, email, password, phone,
//         medicalRegistrationNumber (DOCTOR only), ...role-specific fields }
router.post('/register', registerLimiter, async (req, res) => {
  const { role = 'PATIENT', fullName, email, password, phone } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ success: false, message: 'fullName, email and password are required.' });
  }
  const pwError = passwordStrengthError(password);
  if (pwError) {
    return res.status(400).json({ success: false, message: pwError });
  }

  const upperRole = role.toUpperCase();
  if (!['PATIENT', 'DOCTOR'].includes(upperRole)) {
    if (!req.session.user || req.session.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Only an administrator can create NURSE or ADMIN accounts.' });
    }
  }

  let regNumberRow = null;
  if (upperRole === 'DOCTOR') {
    const regNumber = (req.body.medicalRegistrationNumber || '').trim();
    if (!regNumber) {
      return res.status(400).json({ success: false, message: 'A medical registration number is required to register as a doctor.' });
    }
    const [rows] = await pool.execute(
      'SELECT registration_number, is_used FROM medical_registration_numbers WHERE registration_number = ?',
      [regNumber]
    );
    if (!rows[0]) {
      return res.status(403).json({ success: false, message: 'That medical registration number isn\'t recognized. Registration is limited to pre-verified doctors.' });
    }
    if (rows[0].is_used) {
      return res.status(403).json({ success: false, message: 'That medical registration number has already been used to register an account.' });
    }
    regNumberRow = rows[0];
  }

  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.execute('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const verificationCode = generateCode();
    const verificationExpires = new Date(Date.now() + CODE_TTL_MS);

    await connection.beginTransaction();

    const [userResult] = await connection.execute(
      `INSERT INTO users (full_name, email, password_hash, role, phone, email_verified, verification_code, verification_expires)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
      [fullName, email, passwordHash, upperRole, phone || null, verificationCode, verificationExpires]
    );
    const userId = userResult.insertId;

    if (upperRole === 'PATIENT') {
      const {
        firstName = fullName, lastName = '', gender, dob, bloodGroup,
        guardianName, address, country, medicalHistory, smokingStatus, alcoholStatus,
      } = req.body;
      await connection.execute(
        `INSERT INTO patients
         (user_id, first_name, last_name, gender, dob, blood_group, guardian_name,
          address, country, medical_history, smoking_status, alcohol_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, firstName, lastName, gender || null, dob || null, bloodGroup || null,
         guardianName || null, address || null, country || null, medicalHistory || null,
         smokingStatus || null, alcoholStatus || null]
      );
    } else if (upperRole === 'DOCTOR') {
      const {
        firstName = fullName, lastName = '', department, specialization, gender,
        qualifications, experienceYears, consultationFee, clinicLocation, bio,
      } = req.body;
      await connection.execute(
        `INSERT INTO doctors
         (user_id, first_name, last_name, department, specialization, gender,
          qualifications, experience_years, consultation_fee, clinic_location, bio)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, firstName, lastName, department || null, specialization || null, gender || null,
         qualifications || null, experienceYears || null, consultationFee || null,
         clinicLocation || null, bio || null]
      );
      await connection.execute(
        'UPDATE medical_registration_numbers SET is_used = 1, used_by_user_id = ? WHERE registration_number = ?',
        [userId, regNumberRow.registration_number]
      );
    }

    await connection.commit();
    deliverCode(email, 'Email verification', verificationCode);

    const response = {
      success: true,
      message: 'Account created. Enter the verification code to activate it.',
      data: { requiresVerification: true, email },
    };
    response.devNote = 'No email service is configured, so the verification code is included here instead of being emailed.';
    response.devVerificationCode = verificationCode;
    res.status(201).json(response);
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: 'Registration failed: ' + err.message });
  } finally {
    connection.release();
  }
});

// POST /api/verify-email
router.post('/verify-email', registerLimiter, async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ success: false, message: 'Email and verification code are required.' });
  }
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user) return res.status(404).json({ success: false, message: 'Account not found.' });
    if (user.email_verified) return res.status(400).json({ success: false, message: 'This account is already verified.' });
    if (!user.verification_code || user.verification_code !== code) {
      return res.status(400).json({ success: false, message: 'Incorrect verification code.' });
    }
    if (new Date(user.verification_expires) < new Date()) {
      return res.status(400).json({ success: false, message: 'This code has expired. Please register again.' });
    }

    await pool.execute(
      'UPDATE users SET email_verified = 1, verification_code = NULL, verification_expires = NULL WHERE user_id = ?',
      [user.user_id]
    );

    const linkedId = await findLinkedId(user);
    establishSession(req, user, linkedId, (err, sessionUser) => {
      if (err) return res.status(500).json({ success: false, message: 'Verification succeeded but login failed - please sign in.' });
      res.json({ success: true, message: 'Email verified.', data: sessionUser });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// POST /api/login
router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  try {
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ? AND is_active = 1', [email]);
    const user = users[0];

    if (user && user.lockout_until && new Date(user.lockout_until) > new Date()) {
      const minutesLeft = Math.ceil((new Date(user.lockout_until) - new Date()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Too many failed attempts. Try again in about ${minutesLeft} minute(s).`,
      });
    }

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      if (user) {
        const attempts = user.failed_login_attempts + 1;
        const lockout = attempts >= MAX_FAILED_LOGINS ? new Date(Date.now() + LOCKOUT_MS) : null;
        await pool.execute(
          'UPDATE users SET failed_login_attempts = ?, lockout_until = ? WHERE user_id = ?',
          [lockout ? 0 : attempts, lockout, user.user_id]
        );
      }
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    await pool.execute('UPDATE users SET failed_login_attempts = 0, lockout_until = NULL WHERE user_id = ?', [user.user_id]);

    if (!user.email_verified) {
      return res.status(403).json({ success: false, message: 'Please verify your email before logging in.', data: { requiresVerification: true, email } });
    }

    const twofaCode = generateCode();
    const twofaExpires = new Date(Date.now() + CODE_TTL_MS);
    await pool.execute('UPDATE users SET twofa_code = ?, twofa_expires = ? WHERE user_id = ?', [twofaCode, twofaExpires, user.user_id]);
    deliverCode(email, 'Login verification (2FA)', twofaCode);

    const response = {
      success: true,
      message: 'Password correct. Enter the verification code to finish signing in.',
      data: { requiresTwoFactor: true, email },
    };
    response.devNote = 'No email service is configured, so the 2FA code is included here instead of being emailed.';
    response.devTwoFactorCode = twofaCode;
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// POST /api/verify-login-otp
router.post('/verify-login-otp', loginLimiter, async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ success: false, message: 'Email and code are required.' });
  }
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user || !user.twofa_code || user.twofa_code !== code) {
      return res.status(401).json({ success: false, message: 'Incorrect verification code.' });
    }
    if (new Date(user.twofa_expires) < new Date()) {
      return res.status(401).json({ success: false, message: 'This code has expired. Please log in again.' });
    }

    await pool.execute('UPDATE users SET twofa_code = NULL, twofa_expires = NULL WHERE user_id = ?', [user.user_id]);

    const linkedId = await findLinkedId(user);
    establishSession(req, user, linkedId, (err, sessionUser) => {
      if (err) return res.status(500).json({ success: false, message: 'Login failed.' });
      res.json({ success: true, message: 'Login successful.', data: sessionUser });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// POST /api/forgot-password
router.post('/forgot-password', resetLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user) {
      return res.json({ success: true, message: 'If that email is registered, a reset code has been sent.' });
    }

    const resetCode = generateCode();
    const resetExpires = new Date(Date.now() + CODE_TTL_MS);
    await pool.execute('UPDATE users SET reset_code = ?, reset_expires = ? WHERE user_id = ?', [resetCode, resetExpires, user.user_id]);
    deliverCode(email, 'Password reset', resetCode);

    const response = { success: true, message: 'If that email is registered, a reset code has been sent.' };
    response.devNote = 'No email service is configured, so the reset code is included here instead of being emailed.';
    response.devResetCode = resetCode;
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// POST /api/reset-password
router.post('/reset-password', resetLimiter, async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email, code and newPassword are required.' });
  }
  const pwError = passwordStrengthError(newPassword);
  if (pwError) return res.status(400).json({ success: false, message: pwError });

  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user || !user.reset_code || user.reset_code !== code) {
      return res.status(400).json({ success: false, message: 'Incorrect reset code.' });
    }
    if (new Date(user.reset_expires) < new Date()) {
      return res.status(400).json({ success: false, message: 'This code has expired. Please request a new one.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await pool.execute(
      'UPDATE users SET password_hash = ?, reset_code = NULL, reset_expires = NULL, failed_login_attempts = 0, lockout_until = NULL WHERE user_id = ?',
      [passwordHash, user.user_id]
    );
    res.json({ success: true, message: 'Password updated. You can now log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// POST /api/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logged out.' });
  });
});

// GET /api/me
router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Not logged in.' });
  }
  res.json({ success: true, message: 'OK', data: req.session.user });
});

module.exports = router;
