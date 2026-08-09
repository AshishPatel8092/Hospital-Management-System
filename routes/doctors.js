const express = require('express');
const pool = require('../db');

const router = express.Router();

const DOCTOR_SELECT = `
  SELECT d.*, u.email, u.phone,
    (SELECT COUNT(DISTINCT a.patient_id) FROM appointments a WHERE a.doctor_id = d.doctor_id) AS patients_treated
  FROM doctors d
  JOIN users u ON u.user_id = d.user_id`;

// GET /api/doctors                -> list all
// GET /api/doctors?department=X   -> filter by department
// GET /api/doctors?id=5           -> single doctor
router.get('/', async (req, res) => {
  try {
    if (req.query.id) {
      const [rows] = await pool.execute(`${DOCTOR_SELECT} WHERE d.doctor_id = ?`, [req.query.id]);
      if (!rows[0]) return res.status(404).json({ success: false, message: 'Doctor not found.' });
      return res.json({ success: true, message: 'OK', data: rows[0] });
    }

    let sql = DOCTOR_SELECT;
    const params = [];
    if (req.query.department) {
      sql += ' WHERE d.department = ?';
      params.push(req.query.department);
    }
    sql += ' ORDER BY d.first_name';

    const [rows] = await pool.execute(sql, params);
    res.json({ success: true, message: 'OK', data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

module.exports = router;

