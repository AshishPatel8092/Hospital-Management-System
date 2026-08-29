const pool = require('./db');

/**
 * This project doesn't integrate a real payment gateway (no live API keys,
 * no PCI-handling infrastructure). Instead of trusting a button click,
 * every "Paid" bill has to carry a real-looking UPI transaction reference
 * (UTR) - the 12-digit number every UPI app (Google Pay, PhonePe, Paytm,
 * BHIM, ...) shows in the transaction/payment history right after a
 * payment goes through. The person pays via the QR code / UPI ID shown on
 * screen, opens their UPI app's transaction history, copies that number
 * in, and only then does the backend accept the bill as Paid.
 *
 * This is what stops "I clicked Paid but never actually paid": without a
 * validly-formatted UTR, the server rejects the request outright.
 */
const UTR_REGEX = /^[0-9]{12}$/;

function isValidTransactionRef(value) {
  return typeof value === 'string' && UTR_REGEX.test(value.trim());
}

/**
 * Called right after an appointment is created (see routes/appointments.js
 * and routes/demo.js) so every booking path ends with a real billing row.
 *
 * paymentMethod is either 'UPI' (the only real online option - requires a
 * valid transactionRef, and results in an already-Paid bill) or omitted/
 * 'Cash' (pay-at-hospital, results in a Pending bill the patient can pay
 * later from their dashboard, again only via UPI).
 */
async function createAppointmentBill({ patientId, doctorId, appointmentId, paymentMethod, transactionRef }) {
  const [doctorRows] = await pool.execute(
    'SELECT consultation_fee FROM doctors WHERE doctor_id = ?',
    [doctorId]
  );
  const fee = doctorRows[0] && doctorRows[0].consultation_fee != null
    ? Number(doctorRows[0].consultation_fee)
    : 500; // fallback for doctors who didn't set a fee at registration

  const method = paymentMethod || 'Cash';
  let paymentStatus = 'Pending';
  let ref = null;

  if (method === 'UPI') {
    if (!isValidTransactionRef(transactionRef)) {
      const err = new Error(
        'Payment not verified. Please complete the payment via the QR code or UPI ID, then enter the 12-digit UPI transaction ID (UTR) from your UPI app.'
      );
      err.status = 400;
      throw err;
    }
    paymentStatus = 'Paid';
    ref = transactionRef.trim();
  }

  const [result] = await pool.execute(
    `INSERT INTO billing (patient_id, appointment_id, description, amount, payment_method, transaction_ref, payment_status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [patientId, appointmentId, 'Consultation fee', fee, method, ref, paymentStatus]
  );

  return { billId: result.insertId, amount: fee, paymentMethod: method, paymentStatus, transactionRef: ref };
}

module.exports = { createAppointmentBill, isValidTransactionRef, UTR_REGEX };
