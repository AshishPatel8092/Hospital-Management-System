/**
 * Since the backend now serves this HTML file itself (see server.js),
 * all API calls are same-origin relative paths - no CORS, no separate port.
 */
async function apiRequest(path, method = 'GET', body = null) {
  const options = {
    method,
    credentials: 'include', // sends the session cookie
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store', // billing/appointment status can change between calls - never serve a stale cached response
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`/api${path}`, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data.data || null; // e.g. { requiresVerification, email } on a 403 login response
    throw err;
  }
  return data;
}

// ----- Auth: registration -----
function registerPatient(fields) {
  return apiRequest('/register', 'POST', { role: 'PATIENT', ...fields });
}
function registerDoctor(fields) {
  return apiRequest('/register', 'POST', { role: 'DOCTOR', ...fields });
}

// ----- Auth: login -----
function login(email, password) {
  return apiRequest('/login', 'POST', { email, password });
}

// ----- Auth: forgot / reset password -----
function forgotPassword(email) {
  return apiRequest('/forgot-password', 'POST', { email });
}
function resetPassword(email, code, newPassword) {
  return apiRequest('/reset-password', 'POST', { email, code, newPassword });
}

function logout() {
  return apiRequest('/logout', 'POST');
}
function getCurrentUser() {
  return apiRequest('/me', 'GET');
}
function listDoctors(department) {
  const q = department ? `?department=${encodeURIComponent(department)}` : '';
  return apiRequest(`/doctors${q}`, 'GET');
}
function bookAppointment(fields) {
  return apiRequest('/appointments', 'POST', fields);
}
function bookServiceSlot(fields) {
  return apiRequest('/service-bookings', 'POST', fields);
}
function getBookedServiceSlots(serviceName, date) {
  const q = `?serviceName=${encodeURIComponent(serviceName)}&date=${encodeURIComponent(date)}`;
  return apiRequest(`/service-bookings${q}`, 'GET');
}
function getBookedDoctorSlots(doctorId, date) {
  const q = `?doctorId=${encodeURIComponent(doctorId)}&date=${encodeURIComponent(date)}`;
  return apiRequest(`/availability/doctor${q}`, 'GET');
}
function listAppointments() {
  return apiRequest('/appointments', 'GET');
}
function listMyBills() {
  return apiRequest('/billing', 'GET');
}
function payBill(billId, transactionRef) {
  return apiRequest(`/billing?id=${billId}`, 'PUT', { paymentStatus: 'Paid', paymentMethod: 'UPI', transactionRef });
}
function listPharmacyStock() {
  return apiRequest('/pharmacy', 'GET');
}
function submitContactForm(fields) {
  return apiRequest('/contact', 'POST', fields);
}
function submitDemoRequest(fields) {
  return apiRequest('/demo-requests', 'POST', fields);
}
function listPrescriptions(patientId) {
  const q = patientId ? `?patientId=${encodeURIComponent(patientId)}` : '';
  return apiRequest(`/prescriptions${q}`, 'GET');
}
function addPrescription(fields) {
  return apiRequest('/prescriptions', 'POST', fields);
}
function submitFeedback(fields) {
  return apiRequest('/feedback', 'POST', fields);
}
function submitInsuranceQuery(fields) {
  return apiRequest('/insurance-queries', 'POST', fields);
}

// ----- Shared client-side validation helpers -----
// These mirror the server-side checks so the person gets instant feedback,
// but the server is always the authority - these never replace it.
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
function isStrongPassword(value) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value);
}
function passwordStrengthHint() {
  return 'At least 8 characters, with an uppercase letter, a lowercase letter, a number, and a special character.';
}

// ----- Shared: real UPI/QR payment widget -----
// Used by appointment.html, payment.html, and patient.html's "Pay Now"
// modal so the whole site pays through the exact same interface: scan a
// QR code (or copy the UPI ID) in any UPI app, then enter the 12-digit
// transaction ID (UTR) that app shows once the payment succeeds. The
// server refuses to mark anything Paid without a validly-formatted UTR -
// that's what turns "clicked Paid without paying" into a clear alert.
const CASTO_UPI_ID = '8092341577-2@ybl';
const CASTO_UPI_PAYEE = 'Casto Healthcare';

function isValidUtr(value) {
  return /^[0-9]{12}$/.test((value || '').trim());
}

function buildUpiUri(amount, note) {
  const amt = Number(amount) > 0 ? Number(amount) : 1;
  return `upi://pay?pa=${encodeURIComponent(CASTO_UPI_ID)}&pn=${encodeURIComponent(
    CASTO_UPI_PAYEE,
  )}&am=${amt}&cu=INR&tn=${encodeURIComponent(note || 'Payment')}`;
}

// Renders the QR + UPI-ID + "Pay via UPI App" block into the given
// container element, and wires the copy button. Assumes the qrcodejs
// library (window.QRCode) is already loaded on the page.
function renderUpiPayBlock(container, amount, note) {
  container.innerHTML = `
    <div class="hms-upi-block">
      <div class="hms-upi-qr" id="hmsUpiQr"></div>
      <div class="hms-upi-id-row">
        <code id="hmsUpiIdText">${CASTO_UPI_ID}</code>
        <button type="button" class="hms-upi-copy-btn" id="hmsUpiCopyBtn">Copy</button>
      </div>
      <a href="#" id="hmsUpiAppLink" class="hms-upi-app-btn">Pay via UPI App</a>
      <p class="hms-upi-hint">Scan the QR or tap the button above in Google Pay, PhonePe, Paytm, or any UPI app. After paying, open that app's transaction history and copy the <b>12-digit UPI transaction ID (UTR)</b> into the box below.</p>
      <label class="hms-utr-label" for="hmsUtrInput">UPI Transaction ID (UTR) <span style="color:#dc2626">*</span></label>
      <input type="text" id="hmsUtrInput" class="hms-utr-input" placeholder="e.g. 402812345678" inputmode="numeric" maxlength="12" autocomplete="off" />
      <div class="hms-utr-error" id="hmsUtrError" style="display:none"></div>
    </div>
  `;

  const qrBox = document.getElementById('hmsUpiQr');
  if (window.QRCode) {
    new QRCode(qrBox, { text: buildUpiUri(amount, note), width: 170, height: 170 });
  } else {
    qrBox.textContent = 'QR unavailable — use the UPI ID below.';
  }

  document.getElementById('hmsUpiAppLink').href = buildUpiUri(amount, note);
  document.getElementById('hmsUpiCopyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(CASTO_UPI_ID).then(() => {
      const btn = document.getElementById('hmsUpiCopyBtn');
      const original = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => (btn.textContent = original), 1500);
    });
  });

  // Only digits, capped at 12 - matches what a real UTR looks like.
  const utrInput = document.getElementById('hmsUtrInput');
  utrInput.addEventListener('input', () => {
    utrInput.value = utrInput.value.replace(/\D/g, '').slice(0, 12);
    document.getElementById('hmsUtrError').style.display = 'none';
  });
}

// Reads + validates the UTR the person typed into the block rendered by
// renderUpiPayBlock(). Returns the trimmed UTR string on success; on
// failure it shows an inline error, fires a blocking alert (so it's
// impossible to miss on mobile), and returns null.
function readAndValidateUtr() {
  const input = document.getElementById('hmsUtrInput');
  const errorEl = document.getElementById('hmsUtrError');
  const value = input ? input.value.trim() : '';

  if (!isValidUtr(value)) {
    const message = !value
      ? "Payment not received. Please complete the payment via the QR code or UPI ID, then enter the 12-digit UPI transaction ID (UTR) from your UPI app before confirming."
      : 'That doesn\'t look like a valid UTR — it should be exactly 12 digits, exactly as shown in your UPI app.';
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
    alert(message);
    if (input) input.focus();
    return null;
  }
  return value;
}

// ----- Shared: back button + confirm-before-logout -----
// Call on any page that isn't the homepage, to add a "go back" control
// that returns to wherever the person actually came from.
function renderBackButton(topOffset) {
  // position:fixed takes this completely out of the page's own layout flow
  // (flex/grid centering, etc.), so it can never compete for space with
  // the page's real content or throw off its responsive behavior - it
  // just floats consistently in the same corner of the viewport.
  const btn = document.createElement('button');
  btn.textContent = '← Back';
  btn.type = 'button';
  btn.className = 'hms-back-btn';
  btn.style.cssText =
    'position:fixed;top:' + (topOffset || 16) + 'px;left:16px;z-index:2000;' +
    'display:inline-flex;align-items:center;gap:6px;background:#fff;' +
    'border:1px solid #ddd;border-radius:20px;padding:8px 16px;' +
    'font-size:13px;font-weight:600;color:#333;cursor:pointer;' +
    'box-shadow:0 2px 8px rgba(0,0,0,0.12);';
  btn.addEventListener('mouseenter', () => (btn.style.background = '#f5f5f5'));
  btn.addEventListener('mouseleave', () => (btn.style.background = '#fff'));
  btn.addEventListener('click', () => {
    // history.back() silently does nothing when this page was opened in a
    // new tab, since a new tab has no history to go back to. Navigating
    // straight to the referrer works either way.
    if (document.referrer && document.referrer.includes(window.location.host)) {
      window.location.href = document.referrer;
    } else {
      window.location.href = 'index.html';
    }
  });
  document.body.appendChild(btn);
}

// Wraps a logout action with a confirmation prompt, so a stray click
// doesn't sign someone out by accident.
function confirmLogout(doLogout) {
  if (window.confirm('Are you sure you want to log out?')) {
    doLogout();
  }
}
