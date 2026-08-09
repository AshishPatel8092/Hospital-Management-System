const express = require('express');
const pool = require('../db');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();
router.use(requireLogin);

const BASE_SELECT = `
  SELECT r.*, CONCAT(p.first_name,' ',p.last_name) AS patient_name,
         CONCAT(d.first_name,' ',d.last_name) AS doctor_name
  FROM prescriptions r
  JOIN patients p ON p.patient_id = r.patient_id
  JOIN doctors d  ON d.doctor_id  = r.doctor_id`;

// GET /api/prescriptions           -> role-scoped listing
//   PATIENT: only their own medications
//   DOCTOR:  only medications they prescribed
//   ADMIN:   everything
// GET /api/prescriptions?patientId=5 -> DOCTOR/ADMIN only, one patient's medications
router.get('/', async (req, res) => {
  const { role, linkedId } = req.session.user;

  try {
    if (req.query.patientId) {
      if (role !== 'DOCTOR' && role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Not authorized.' });
      }
      const [rows] = await pool.execute(
        `${BASE_SELECT} WHERE r.patient_id = ? ORDER BY r.prescribed_date DESC`,
        [req.query.patientId]
      );
      return res.json({ success: true, message: 'OK', data: rows });
    }

    let sql = `${BASE_SELECT} `;
    const params = [];
    if (role === 'PATIENT') {
      sql += 'WHERE r.patient_id = ? ';
      params.push(linkedId);
    } else if (role === 'DOCTOR') {
      sql += 'WHERE r.doctor_id = ? ';
      params.push(linkedId);
    }
    sql += 'ORDER BY r.prescribed_date DESC';

    const [rows] = await pool.execute(sql, params);
    res.json({ success: true, message: 'OK', data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// POST /api/prescriptions - DOCTOR only.
// Body: { patientId, appointmentId?, medicationName, dosage, instructions }
router.post('/', async (req, res) => {
  const { role, linkedId } = req.session.user;
  if (role !== 'DOCTOR') {
    return res.status(403).json({ success: false, message: 'Only doctors can add prescriptions.' });
  }
  const { patientId, appointmentId, medicationName, dosage, instructions } = req.body;
  if (!patientId || !medicationName) {
    return res.status(400).json({ success: false, message: 'patientId and medicationName are required.' });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO prescriptions (patient_id, doctor_id, appointment_id, medication_name, dosage, instructions)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [patientId, linkedId, appointmentId || null, medicationName, dosage || null, instructions || null]
    );
    res.status(201).json({ success: true, message: 'Prescription added.', data: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

module.exports = router;
