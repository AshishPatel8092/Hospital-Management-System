require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED PROMISE REJECTION - this would otherwise fail silently:', err);
});
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION - process is about to exit:', err);
});

const app = express();
app.set('trust proxy', 1); // Railway (and most PaaS hosts) sit behind a reverse proxy

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 60 * 1000, // 30 minutes
    httpOnly: true,
  },
}));

// The frontend (login.html, register-p.html, etc.) is served straight from
// /public, on the SAME origin as the API below. That means the browser
// never makes a cross-origin request, so no CORS setup is needed at all.
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', require('./routes/auth'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api/pharmacy', require('./routes/pharmacy'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/demo-requests', require('./routes/demo'));
app.use('/api/prescriptions', require('./routes/prescriptions'));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'API is running.' }));

// Anything under /api/* that didn't match a route above is a genuinely
// unknown endpoint - respond with JSON, not the HTML 404 page.
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found.' });
});

// Any other unmatched URL (a typo'd or removed page) gets the friendly
// 404 page instead of Express's default plain-text error.
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Last-resort handler for anything that slips past every route's own
// try/catch - keeps a stray error from ever showing a stack trace to a
// visitor, and still logs the real cause server-side for debugging.
app.use((err, req, res, next) => {
  console.error('Unhandled error in request pipeline:', err);
  res.status(500).json({ success: false, message: 'Something went wrong on our end.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HMS server running on http://localhost:${PORT}`));
