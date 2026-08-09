require('dotenv').config();
const mysql = require('mysql2/promise');

// A pool hands out connections as needed and reuses them - simpler and
// safer than opening a new connection by hand in every route.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10000, // fail fast (10s) instead of hanging if the DB is unreachable
});

// Runs once at startup so a bad DB_HOST/DB_PASSWORD/etc. shows up clearly
// in the deployment logs immediately, instead of surfacing later as a
// vague "Application failed to respond" on the first real request.
pool.getConnection()
  .then((conn) => {
    console.log('Database connection OK (' + process.env.DB_HOST + ':' + (process.env.DB_PORT || 3306) + ')');
    conn.release();
  })
  .catch((err) => {
    console.error('Database connection FAILED at startup:', err.message);
    console.error('Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME in your environment variables.');
  });

module.exports = pool;
