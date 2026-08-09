const pool = require('./db');

/**
 * This project doesn't integrate a real payment gateway (no live API keys,
 * no PCI-handling infrastructure - appropriate for a college project). This
 * simulates one instead: "Cash" always creates a Pending bill payable at
 * the hospital, while "UPI"/"Card"/"Online" simulate an instantly
 * successful online payment and create the bill already marked Paid.
 *
 * Called right after an appointment is created (see routes/appointments.js
 * and routes/demo.js) so every booking path ends with a real billing row,
 * not just an appointment.
 */
async function createAppointmentBill({ patientId, doctorId, appointmentId, paymentMethod }) {
  const [doctorRows] = await pool.execute(
    'SELECT consultation_fee FROM doctors WHERE doctor_id = ?',
    [doctorId]
  );
  const fee = doctorRows[0] && doctorRows[0].consultation_fee != null
    ? Number(doctorRows[0].consultation_fee)
    : 500; // fallback for doctors who didn't set a fee at registration

  const method = paymentMethod || 'Cash';
  const isOnline = ['UPI', 'Card', 'Online'].includes(method);
  const paymentStatus = isOnline ? 'Paid' : 'Pending';

  const [result] = await pool.execute(
    `INSERT INTO billing (patient_id, appointment_id, description, amount, payment_method, payment_status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [patientId, appointmentId, 'Consultation fee', fee, method, paymentStatus]
  );

  return { billId: result.insertId, amount: fee, paymentMethod: method, paymentStatus };
}

module.exports = { createAppointmentBill };
