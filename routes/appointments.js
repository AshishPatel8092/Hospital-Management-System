const express = require('express');
const pool = require('../db');
const { requireLogin } = require('../middleware/auth');
const { createAppointmentBill } = require('../billingHelper');

const router = express.Router();
router.use(requireLogin);

const BASE_SELECT = `
  SELECT a.*, CONCAT(p.first_name,' ',p.last_name) AS patient_name,
         CONCAT(d.first_name,' ',d.last_name) AS doctor_name
  FROM appointments a
  JOIN patients p ON p.patient_id = a.patient_id
  JOIN doctors d  ON d.doctor_id  = a.doctor_id`;

// GET /api/appointments        -> role-scoped listing
// GET /api/appointments?id=5   -> single appointment (with ownership check)
router.get('/', async (req, res) => {
  const { role, linkedId } = req.session.user;
  try {
    if (req.query.id) {
      const [rows] = await pool.execute(`${BASE_SELECT} WHERE a.appointment_id = ?`, [req.query.id]);
      const appt = rows[0];
      if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found.' });
      if (role === 'PATIENT' && linkedId !== appt.patient_id) {
        return res.status(403).json({ success: false, message: 'Not your appointment.' });
      }
      if (role === 'DOCTOR' && linkedId !== appt.doctor_id) {
        return res.status(403).json({ success: false, message: 'Not your appointment.' });
      }
      return res.json({ success: true, message: 'OK', data: appt });
    }

    let sql = `${BASE_SELECT} `;
    const params = [];
    if (role === 'PATIENT') {
      sql += 'WHERE a.patient_id = ? ';
      params.push(linkedId);
    } else if (role === 'DOCTOR') {
      sql += 'WHERE a.doctor_id = ? ';
      params.push(linkedId);
    }
    sql += 'ORDER BY a.appointment_date DESC';

    const [rows] = await pool.execute(sql, params);
    res.json({ success: true, message: 'OK', data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// POST /api/appointments - book a new appointment
// Body: { doctorId, appointmentDate, slotTime, visitType, reason, patientId (NURSE/ADMIN only) }
router.post('/', async (req, res) => {
  const { role, userId, linkedId } = req.session.user;
  const { doctorId, appointmentDate, slotTime, visitType, reason, paymentMethod } = req.body;

  if (!doctorId || !appointmentDate) {
    return res.status(400).json({ success: false, message: 'doctorId and appointmentDate are required.' });
  }

  let patientId;
  if (role === 'PATIENT') {
    patientId = linkedId; // patients can only ever book for themselves
  } else if (role === 'NURSE' || role === 'ADMIN') {
    if (!req.body.patientId) {
      return res.status(400).json({ success: false, message: 'patientId is required.' });
    }
    patientId = req.body.patientId;
  } else {
    return res.status(403).json({ success: false, message: 'Doctors cannot book appointments.' });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_date, slot_time, visit_type, reason, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [patientId, doctorId, appointmentDate, slotTime || null, visitType || 'In-person', reason || null, userId]
    );
    const appointmentId = result.insertId;

    const bill = await createAppointmentBill({ patientId, doctorId, appointmentId, paymentMethod });

    res.status(201).json({
      success: true,
      message: 'Appointment booked.',
      data: { appointmentId, bill },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// PUT /api/appointments?id=5 - update status. Body: { status }
router.put('/', async (req, res) => {
  const { role } = req.session.user;
  if (!['ADMIN', 'DOCTOR', 'NURSE'].includes(role)) {
    return res.status(403).json({ success: false, message: 'Not authorized to update appointments.' });
  }
  if (!req.query.id) return res.status(400).json({ success: false, message: 'id query parameter is required.' });
  if (!req.body.status) return res.status(400).json({ success: false, message: 'status is required.' });

  try {
    const [result] = await pool.execute(
      'UPDATE appointments SET status = ? WHERE appointment_id = ?',
      [req.body.status, req.query.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    res.json({ success: true, message: 'Appointment updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

module.exports = router;
