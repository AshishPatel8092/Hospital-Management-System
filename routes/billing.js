const express = require('express');
const pool = require('../db');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();
router.use(requireLogin);

const BASE_SELECT = `
  SELECT b.*, CONCAT(p.first_name,' ',p.last_name) AS patient_name
  FROM billing b JOIN patients p ON p.patient_id = b.patient_id`;

// GET /api/billing            -> ADMIN: all. PATIENT: own only. DOCTOR/NURSE: forbidden.
// GET /api/billing?id=5       -> single bill, same ownership rule
router.get('/', async (req, res) => {
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
router.put('/', async (req, res) => {
  if (req.session.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Only admin staff can update bills.' });
  }
  if (!req.query.id) return res.status(400).json({ success: false, message: 'id query parameter is required.' });
  if (!req.body.paymentStatus) return res.status(400).json({ success: false, message: 'paymentStatus is required.' });

  try {
    const [result] = await pool.execute(
      'UPDATE billing SET payment_status = ? WHERE bill_id = ?',
      [req.body.paymentStatus, req.query.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Bill not found.' });
    res.json({ success: true, message: 'Bill updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

module.exports = router;
