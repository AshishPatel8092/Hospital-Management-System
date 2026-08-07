const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');

const router = express.Router();

// POST /api/register
// Body: { role: 'PATIENT' | 'DOCTOR', fullName, email, password, phone, ...role-specific fields }
router.post('/register', async (req, res) => {
  const { role = 'PATIENT', fullName, email, password, phone } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ success: false, message: 'fullName, email and password are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
  }

  const upperRole = role.toUpperCase();
  if (!['PATIENT', 'DOCTOR'].includes(upperRole)) {
    // NURSE/ADMIN accounts should only be created by an already-logged-in admin
    if (!req.session.user || req.session.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Only an administrator can create NURSE or ADMIN accounts.' });
    }
  }

  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.execute('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await connection.beginTransaction();

    const [userResult] = await connection.execute(
      'INSERT INTO users (full_name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
      [fullName, email, passwordHash, upperRole, phone || null]
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
      const { firstName = fullName, lastName = '', department, specialization, gender } = req.body;
      await connection.execute(
        `INSERT INTO doctors (user_id, first_name, last_name, department, specialization, gender)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, firstName, lastName, department || null, specialization || null, gender || null]
      );
    }

    await connection.commit();
    res.status(201).json({ success: true, message: 'Registration successful. You can now log in.' });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: 'Registration failed: ' + err.message });
  } finally {
    connection.release();
  }
});

// POST /api/login
// Body: { email, password }
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  try {
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ? AND is_active = 1', [email]
    );
    const user = users[0];

    // Same generic error either way, so login can't be used to check which emails exist.
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    let linkedId = null;
    if (user.role === 'PATIENT') {
      const [rows] = await pool.execute('SELECT patient_id FROM patients WHERE user_id = ?', [user.user_id]);
      if (rows[0]) linkedId = rows[0].patient_id;
    } else if (user.role === 'DOCTOR') {
      const [rows] = await pool.execute('SELECT doctor_id FROM doctors WHERE user_id = ?', [user.user_id]);
      if (rows[0]) linkedId = rows[0].doctor_id;
    }

    req.session.regenerate((err) => { // fresh session id on every login, prevents session fixation
      if (err) return res.status(500).json({ success: false, message: 'Login failed.' });

      req.session.user = {
        userId: user.user_id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        linkedId,
      };
      res.json({ success: true, message: 'Login successful.', data: req.session.user });
    });
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

// GET /api/me - who is currently logged in
router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Not logged in.' });
  }
  res.json({ success: true, message: 'OK', data: req.session.user });
});

module.exports = router;
