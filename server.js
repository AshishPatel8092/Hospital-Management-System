require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();

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

app.get('/api/health', (req, res) => res.json({ success: true, message: 'API is running.' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HMS server running on http://localhost:${PORT}`));
