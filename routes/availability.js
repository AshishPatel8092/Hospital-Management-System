const express = require('express');
const pool = require('../db');

const router = express.Router();

// GET /api/availability/doctor?doctorId=3&date=2026-08-28
// Public (no login) - only returns already-booked time slots, nothing
// patient-identifying, so the frontend can grey out taken slots and warn
// a person before they even try to book one.
router.get('/doctor', async (req, res) => {
  const { doctorId, date } = req.query;
  if (!doctorId || !date) {
    return res.status(400).json({ success: false, message: 'doctorId and date are required.' });
  }
  try {
    const [rows] = await pool.execute(
      `SELECT slot_time FROM appointments
       WHERE doctor_id = ? AND appointment_date = ? AND status != 'Cancelled'`,
      [doctorId, date]
    );
    res.json({ success: true, message: 'OK', data: rows.map((r) => r.slot_time) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

module.exports = router;
