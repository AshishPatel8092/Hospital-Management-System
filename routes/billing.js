const express = require('express');
const pool = require('../db');
const { requireLogin } = require('../middleware/auth');
const { isValidTransactionRef } = require('../billingHelper');

const router = express.Router();
router.use(requireLogin);

const BASE_SELECT = `
  SELECT b.*, CONCAT(p.first_name,' ',p.last_name) AS patient_name
  FROM billing b JOIN patients p ON p.patient_id = b.patient_id`;

// GET /api/billing            -> ADMIN: all. PATIENT: own only. DOCTOR/NURSE: forbidden.
// GET /api/billing?id=5       -> single bill, same ownership rule
router.get('/', async (req, res) => {
  // Billing data changes the moment a payment is verified, so this must
  // never be served from a stale browser/proxy cache.
  res.set('Cache-Control', 'no-store');
  const { role, linkedId } = req.session.user;
  if (role !== 'ADMIN' && role !== 'PATIENT') {
    return res.status(403).json({ success: false, message: 'Not authorized to view billing records.' });
  }

  try {
    if (req.query.id) {
      const [rows] = await pool.execute(`${BASE_SELECT} WHERE b.bill_id = ?`, [req.query.id]);
      const bill = rows[0];
      if (!bill) return res.status(404).json({ success: false, message: 'Bill not found.' });
      if (role === 'PATIENT' && linkedId !== bill.patient_id) {
        return res.status(403).json({ success: false, message: 'Not your bill.' });
      }
      return res.json({ success: true, message: 'OK', data: bill });
    }

    let sql = `${BASE_SELECT} `;
    const params = [];
    if (role === 'PATIENT') {
      sql += 'WHERE b.patient_id = ? ';
      params.push(linkedId);
    }
    sql += 'ORDER BY b.billing_date DESC';

    const [rows] = await pool.execute(sql, params);
    res.json({ success: true, message: 'OK', data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// POST /api/billing - ADMIN only. Body: { patientId, description, amount, appointmentId?, paymentMethod?, paymentStatus? }
router.post('/', async (req, res) => {
  if (req.session.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Only admin staff can create bills.' });
  }
  const { patientId, description, amount, appointmentId, paymentMethod, paymentStatus } = req.body;
  if (!patientId || !description || amount === undefined) {
    return res.status(400).json({ success: false, message: 'patientId, description and amount are required.' });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO billing (patient_id, appointment_id, description, amount, payment_method, payment_status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [patientId, appointmentId || null, description, amount, paymentMethod || null, paymentStatus || 'Pending']
    );
    res.status(201).json({ success: true, message: 'Bill created.', data: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// PUT /api/billing?id=5 - ADMIN only. Body: { paymentStatus }
// PUT /api/billing?id=5 - update payment status.
//   ADMIN can set any status on any bill.
//   PATIENT can only mark their OWN bill as Paid (self-checkout, simulating
//   an online payment) - they can't set arbitrary statuses or touch bills
//   that aren't theirs.
router.put('/', async (req, res) => {
  const { role, linkedId } = req.session.user;
  const { paymentStatus, paymentMethod, transactionRef } = req.body;

  if (!req.query.id) return res.status(400).json({ success: false, message: 'id query parameter is required.' });
  if (!paymentStatus) return res.status(400).json({ success: false, message: 'paymentStatus is required.' });

  try {
    if (role === 'ADMIN') {
      const [result] = await pool.execute(
        'UPDATE billing SET payment_status = ? WHERE bill_id = ?',
        [paymentStatus, req.query.id]
      );
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Bill not found.' });
      return res.json({ success: true, message: 'Bill updated.' });
    }

    if (role === 'PATIENT') {
      if (paymentStatus !== 'Paid') {
        return res.status(403).json({ success: false, message: 'Patients can only mark a bill as paid.' });
      }

      // Real payment verification: a bill only ever moves to Paid if a
      // validly-formatted UPI transaction ID (UTR) is supplied. This is
      // the exact check that turns "click Paid without paying" into a
      // clear rejection instead of a silent, trust-based success.
      if (!isValidTransactionRef(transactionRef)) {
        return res.status(402).json({
          success: false,
          message: 'Payment not received. Please complete the payment via the QR code or UPI ID first, then enter the 12-digit UPI transaction ID (UTR) shown in your UPI app.',
        });
      }

      const [bills] = await pool.execute('SELECT patient_id, payment_status FROM billing WHERE bill_id = ?', [req.query.id]);
      if (!bills[0]) return res.status(404).json({ success: false, message: 'Bill not found.' });
      if (bills[0].patient_id !== linkedId) {
        return res.status(403).json({ success: false, message: 'Not your bill.' });
      }
      if (bills[0].payment_status === 'Paid') {
        return res.status(409).json({ success: false, message: 'This bill has already been paid.' });
      }

      // Guard against the exact same UTR being reused across bills - a
      // real UPI transaction ID can only ever pay for one thing.
      const [dupes] = await pool.execute(
        'SELECT bill_id FROM billing WHERE transaction_ref = ? AND bill_id != ?',
        [transactionRef.trim(), req.query.id]
      );
      if (dupes.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'This UPI transaction ID has already been used for another bill. Please double-check the reference number from your UPI app.',
        });
      }

      const [result] = await pool.execute(
        'UPDATE billing SET payment_status = ?, payment_method = ?, transaction_ref = ? WHERE bill_id = ? AND payment_status != ?',
        ['Paid', 'UPI', transactionRef.trim(), req.query.id, 'Paid']
      );
      if (result.affectedRows === 0) {
        return res.status(409).json({ success: false, message: 'This bill has already been paid.' });
      }
      return res.json({ success: true, message: 'Payment verified and received.' });
    }

    return res.status(403).json({ success: false, message: 'Only admin staff can update bills.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

module.exports = router;
