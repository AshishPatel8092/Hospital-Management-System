const express = require('express');
const pool = require('../db');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// POST /api/insurance-queries - public, anyone can ask about their
// insurance/cashless coverage, no login needed.
// Body: { fullName, email, phone, insurerName, policyNumber, message }
router.post('/', async (req, res) => {
  const { fullName, email, phone, insurerName, policyNumber, message } = req.body;

  if (!fullName || !email || !message) {
    return res.status(400).json({ success: false, message: 'fullName, email and message are required.' });
  }

  try {
    await pool.execute(
      `INSERT INTO insurance_queries (full_name, email, phone, insurer_name, policy_number, message)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [fullName, email, phone || null, insurerName || null, policyNumber || null, message]
    );
    res.status(201).json({
      success: true,
      message: "Thanks - we've received your insurance query and will get back to you within 24 hours.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// GET /api/insurance-queries - ADMIN only, for staff to review submitted queries.
router.get('/', requireRole('ADMIN'), async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM insurance_queries ORDER BY created_at DESC');
    res.json({ success: true, message: 'OK', data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

module.exports = router;
