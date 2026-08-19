const express = require('express');
const pool = require('../db');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

const QUESTION_FIELDS = [
  'q1_navigation', 'q2_booking', 'q3_doctor_info', 'q4_registration', 'q5_design',
  'q6_speed', 'q7_findability', 'q8_recommend', 'q9_billing', 'q10_overall',
];

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// POST /api/feedback - public, anyone can submit, no login required.
// Body: { q1..q10: 1-5, comments: string (max 100 words) }
router.post('/', async (req, res) => {
  const answers = QUESTION_FIELDS.map((key) => Number(req.body[key]));
  if (answers.some((n) => !Number.isInteger(n) || n < 1 || n > 5)) {
    return res.status(400).json({ success: false, message: 'Please answer all 10 questions with a rating from 1 to 5.' });
  }

  const comments = (req.body.comments || '').trim();
  if (comments && countWords(comments) > 100) {
    return res.status(400).json({ success: false, message: 'Comments must be 100 words or fewer.' });
  }

  try {
    const submittedBy = req.session.user ? req.session.user.userId : null;
    const columns = ['submitted_by', ...QUESTION_FIELDS, 'comments'];
    const placeholders = columns.map(() => '?').join(', ');
    const values = [submittedBy, ...answers, comments || null];

    await pool.execute(
      `INSERT INTO feedback_responses (${columns.join(', ')}) VALUES (${placeholders})`,
      values
    );
    res.status(201).json({ success: true, message: 'Thanks for your feedback!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// GET /api/feedback - ADMIN only, for reviewing responses.
router.get('/', requireRole('ADMIN'), async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM feedback_responses ORDER BY created_at DESC');
    res.json({ success: true, message: 'OK', data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

module.exports = router;
