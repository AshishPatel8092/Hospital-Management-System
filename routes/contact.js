const express = require('express');
const pool = require('../db');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// POST /api/contact - public, anyone can send a message, no login needed.
// Body: { fullName, email, phone, message }
router.post('/', async (req, res) => {
  const { fullName, email, phone, message } = req.body;

  if (!fullName || !email || !message) {
    return res.status(400).json({ success: false, message: 'fullName, email and message are required.' });
  }

  try {
    await pool.execute(
      'INSERT INTO contact_messages (full_name, email, phone, message) VALUES (?, ?, ?, ?)',
      [fullName, email, phone || null, message]
    );
    res.status(201).json({
      success: true,
      message: "Thanks for reaching out — we've received your message and will contact you within 24 hours.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// GET /api/contact - ADMIN only, for staff to review incoming messages.
router.get('/', requireRole('ADMIN'), async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json({ success: true, message: 'OK', data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

module.exports = router;
