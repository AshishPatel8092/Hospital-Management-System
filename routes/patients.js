const express = require('express');
const pool = require('../db');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();
router.use(requireLogin);

function stripMedicalHistory(patient) {
  const { medical_history, smoking_status, alcohol_status, ...rest } = patient;
  return rest;
}

// GET /api/patients            -> ADMIN/DOCTOR: full list. NURSE: list without medical history.
// GET /api/patients?id=5       -> single record, with ownership check for PATIENT
// GET /api/patients?self=true  -> PATIENT: their own full record
router.get('/', async (req, res) => {
  const { role, userId, linkedId } = req.session.user;

  try {
    if (req.query.self === 'true') {
      if (role !== 'PATIENT') {
        return res.status(403).json({ success: false, message: 'Only patients can use self=true.' });
      }
      const [rows] = await pool.execute(
        `SELECT p.*, u.full_name, u.email FROM patients p
         JOIN users u ON u.user_id = p.user_id WHERE p.user_id = ?`,
        [userId]
      );
      if (!rows[0]) return res.status(404).json({ success: false, message: 'Patient profile not found.' });
      return res.json({ success: true, message: 'OK', data: rows[0] });
    }

    if (req.query.id) {
      const [rows] = await pool.execute(
        `SELECT p.*, u.full_name, u.email FROM patients p
         JOIN users u ON u.user_id = p.user_id WHERE p.patient_id = ?`,
        [req.query.id]
      );
      const patient = rows[0];
      if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });

      if (role === 'PATIENT') {
        if (linkedId !== patient.patient_id) {
          return res.status(403).json({ success: false, message: 'You can only view your own record.' });
        }
        return res.json({ success: true, message: 'OK', data: patient });
      }
      if (role === 'NURSE') {
        return res.json({ success: true, message: 'OK', data: stripMedicalHistory(patient) });
      }
      if (role === 'ADMIN' || role === 'DOCTOR') {
        return res.json({ success: true, message: 'OK', data: patient });
      }
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    // Full listing
    if (role === 'PATIENT') {
      return res.status(403).json({ success: false, message: 'Patients cannot list all records; use self=true.' });
    }
    const [rows] = await pool.execute(
      `SELECT p.*, u.full_name, u.email FROM patients p
       JOIN users u ON u.user_id = p.user_id ORDER BY p.patient_id DESC`
    );
    const data = role === 'NURSE' ? rows.map(stripMedicalHistory) : rows;
    res.json({ success: true, message: 'OK', data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

module.exports = router;
