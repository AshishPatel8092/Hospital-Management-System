// req.session.user is set at login (see routes/auth.js) and looks like:
// { userId, fullName, email, role, linkedId }
// linkedId is the patient_id (for PATIENT) or doctor_id (for DOCTOR).

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Please log in to continue.' });
  }
  next();
}

// Usage: requireRole('ADMIN') or requireRole('ADMIN', 'NURSE')
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.session.user || !allowedRoles.includes(req.session.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    next();
  };
}

module.exports = { requireLogin, requireRole };
