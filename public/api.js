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
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

function login(email, password) {
  return apiRequest('/login', 'POST', { email, password });
}
function registerPatient(fields) {
  return apiRequest('/register', 'POST', { role: 'PATIENT', ...fields });
}
function registerDoctor(fields) {
  return apiRequest('/register', 'POST', { role: 'DOCTOR', ...fields });
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
