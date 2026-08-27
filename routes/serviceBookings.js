const express = require('express');
const pool = require('../db');

const router = express.Router();

// GET /api/service-bookings?serviceName=X&date=YYYY-MM-DD
// Public - lets the frontend check which time slots are already taken for
// a given service+date, so it can grey them out before the person even
// tries to book (used by the homepage services booking modal).
router.get('/', async (req, res) => {
  const { serviceName, date } = req.query;
  if (!serviceName || !date) {
    return res.status(400).json({ success: false, message: 'serviceName and date are required.' });
  }
  try {
    const [rows] = await pool.execute(
      `SELECT slot_time FROM service_bookings
       WHERE service_name = ? AND booking_date = ? AND status != 'Cancelled'`,
      [serviceName, date]
    );
    res.json({ success: true, message: 'OK', data: rows.map((r) => r.slot_time) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// POST /api/service-bookings - public, no login required (matches how the
// homepage "Our Services" booking modal already works as a guest flow).
// Body: { serviceName, bookingDate, slotTime, guestName, guestPhone, guestEmail }
router.post('/', async (req, res) => {
  const { serviceName, bookingDate, slotTime, guestName, guestPhone, guestEmail } = req.body;

  if (!serviceName || !bookingDate || !slotTime) {
    return res.status(400).json({ success: false, message: 'serviceName, bookingDate and slotTime are required.' });
  }

  try {
    // Prevent two people booking the same service for the same date+time.
    const [conflicts] = await pool.execute(
      `SELECT service_booking_id FROM service_bookings
       WHERE service_name = ? AND booking_date = ? AND slot_time = ? AND status != 'Cancelled'`,
      [serviceName, bookingDate, slotTime]
    );
    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'That service is already booked for the selected date and time. Please choose a different slot.',
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO service_bookings (service_name, booking_date, slot_time, guest_name, guest_phone, guest_email)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [serviceName, bookingDate, slotTime, guestName || null, guestPhone || null, guestEmail || null]
    );
    res.status(201).json({ success: true, message: 'Slot reserved.', data: { serviceBookingId: result.insertId } });
  } catch (err) {
    // A duplicate-key error from the UNIQUE constraint means someone else
    // grabbed this exact slot in the split second between our SELECT check
    // and this INSERT - report it the same friendly way.
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'That service is already booked for the selected date and time. Please choose a different slot.',
      });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

module.exports = router;
