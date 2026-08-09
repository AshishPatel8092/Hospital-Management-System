const express = require('express');
const pool = require('../db');
const { requireRole } = require('../middleware/auth');
const { createAppointmentBill } = require('../billingHelper');

const router = express.Router();

// Very small keyword -> department matcher. Department names must match
// exactly what doctors.department is set to at registration (see
// register.html's department <select>).
const DEPARTMENT_KEYWORDS = [
  { department: 'Cardiology', keywords: ['heart', 'cardiac', 'chest pain', 'cardio', 'blood pressure'] },
  { department: 'Dermatology', keywords: ['skin', 'rash', 'acne', 'derma', 'allergy'] },
  { department: 'Paediatrics', keywords: ['child', 'kid', 'infant', 'baby', 'paediatric', 'pediatric'] },
  { department: 'Orthopaedics', keywords: ['bone', 'fracture', 'joint', 'back pain', 'knee', 'orthopaedic', 'orthopedic'] },
  { department: 'Neurology', keywords: ['headache', 'migraine', 'seizure', 'nerve', 'brain', 'neuro'] },
  { department: 'Gynaecology', keywords: ['pregnan', 'gynae', 'gynaec', 'women', 'menstrual'] },
  { department: 'ENT', keywords: ['ear', 'nose', 'throat', 'sinus', 'hearing'] },
];

function matchDepartment(text) {
  const lower = (text || '').toLowerCase();
  for (const entry of DEPARTMENT_KEYWORDS) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.department;
    }
  }
  return 'General Medicine';
}

// POST /api/demo-requests
// Body: { fullName, email, phone, requirement, preferredDate, preferredTime }
// Public - anyone can submit. If the visitor happens to be logged in as a
// PATIENT, a real appointment is also created with the matched doctor, so
// it shows up on that doctor's dashboard immediately.
router.post('/', async (req, res) => {
  const { fullName, email, phone, requirement, preferredDate, preferredTime, paymentMethod } = req.body;

  if (!fullName || !email || !requirement) {
    return res.status(400).json({ success: false, message: 'fullName, email and requirement are required.' });
  }

  try {
    const department = matchDepartment(requirement);

    const [doctorRows] = await pool.execute(
      `SELECT d.*, u.email AS doctor_email FROM doctors d
       JOIN users u ON u.user_id = d.user_id
       WHERE d.department = ? ORDER BY d.doctor_id LIMIT 1`,
      [department]
    );
    const matchedDoctor = doctorRows[0] || null;

    let appointmentId = null;
    let bookedForPatient = false;
    let bill = null;

    // Only create a real appointment if we found a doctor AND the visitor
    // is logged in as a patient - appointments.patient_id can't be null,
    // so there's no way to attribute a booking to an anonymous visitor.
    if (matchedDoctor && req.session.user && req.session.user.role === 'PATIENT') {
      const [apptResult] = await pool.execute(
        `INSERT INTO appointments (patient_id, doctor_id, appointment_date, slot_time, visit_type, reason, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          req.session.user.linkedId,
          matchedDoctor.doctor_id,
          preferredDate || null,
          preferredTime || null,
          'In-person',
          requirement,
          req.session.user.userId,
        ]
      );
      appointmentId = apptResult.insertId;
      bookedForPatient = true;

      bill = await createAppointmentBill({
        patientId: req.session.user.linkedId,
        doctorId: matchedDoctor.doctor_id,
        appointmentId,
        paymentMethod,
      });
    }

    const [demoResult] = await pool.execute(
      `INSERT INTO demo_requests
       (full_name, email, phone, requirement_text, matched_department, matched_doctor_id, preferred_date, preferred_time, appointment_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fullName, email, phone || null, requirement, department,
        matchedDoctor ? matchedDoctor.doctor_id : null,
        preferredDate || null, preferredTime || null, appointmentId,
      ]
    );

    res.status(201).json({
      success: true,
      message: bookedForPatient
        ? 'Request received and appointment booked.'
        : 'Request received.',
      data: {
        requestId: demoResult.insertId,
        matchedDepartment: department,
        doctor: matchedDoctor
          ? { id: matchedDoctor.doctor_id, name: `Dr. ${matchedDoctor.first_name} ${matchedDoctor.last_name}` }
          : null,
        preferredDate: preferredDate || null,
        preferredTime: preferredTime || null,
        bookedForPatient,
        bill,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// GET /api/demo-requests - ADMIN only, for staff follow-up.
router.get('/', requireRole('ADMIN'), async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM demo_requests ORDER BY created_at DESC');
    res.json({ success: true, message: 'OK', data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

module.exports = router;
