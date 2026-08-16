/**
 * Since the backend now serves this HTML file itself (see server.js),
 * all API calls are same-origin relative paths - no CORS, no separate port.
 */
async function apiRequest(path, method = 'GET', body = null) {
  const options = {
    method,
    credentials: 'include', // sends the session cookie
    headers: { 'Content-Type': 'application/json' },
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

// ----- Auth: registration + email verification -----
function registerPatient(fields) {
  return apiRequest('/register', 'POST', { role: 'PATIENT', ...fields });
}
function registerDoctor(fields) {
  return apiRequest('/register', 'POST', { role: 'DOCTOR', ...fields });
}
function verifyEmail(email, code) {
  return apiRequest('/verify-email', 'POST', { email, code });
}

// ----- Auth: login is now two steps - password, then a verification code -----
function login(email, password) {
  return apiRequest('/login', 'POST', { email, password });
}
function verifyLoginOtp(email, code) {
  return apiRequest('/verify-login-otp', 'POST', { email, code });
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
function listAppointments() {
  return apiRequest('/appointments', 'GET');
}
function listMyBills() {
  return apiRequest('/billing', 'GET');
}
function payBill(billId, paymentMethod) {
  return apiRequest(`/billing?id=${billId}`, 'PUT', { paymentStatus: 'Paid', paymentMethod });
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

// ----- Shared: back button + confirm-before-logout -----
// Call on any page that isn't the homepage, to add a "go back" control
// that returns to wherever the person actually came from.
function renderBackButton(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const btn = document.createElement('button');
  btn.textContent = '← Back';
  btn.type = 'button';
  btn.className = 'hms-back-btn';
  btn.style.cssText =
    'display:inline-flex;align-items:center;gap:6px;background:#fff;' +
    'border:1px solid #ddd;border-radius:20px;padding:8px 16px;' +
    'font-size:13px;font-weight:600;color:#333;cursor:pointer;' +
    'margin-bottom:14px;box-shadow:0 1px 3px rgba(0,0,0,0.08);';
  btn.addEventListener('mouseenter', () => (btn.style.background = '#f5f5f5'));
  btn.addEventListener('mouseleave', () => (btn.style.background = '#fff'));
  btn.addEventListener('click', () => {
    // history.back() silently does nothing when this page was opened in a
    // new tab (e.g. the hamburger menu's registration links use
    // target="_blank"), since a new tab has no history to go back to.
    // Navigating straight to the referrer works either way.
    if (document.referrer && document.referrer.includes(window.location.host)) {
      window.location.href = document.referrer;
    } else {
      window.location.href = 'index.html';
    }
  });
  container.prepend(btn);
}

// Wraps a logout action with a confirmation prompt, so a stray click
// doesn't sign someone out by accident.
function confirmLogout(doLogout) {
  if (window.confirm('Are you sure you want to log out?')) {
    doLogout();
  }
}
