require('dotenv').config();
const mysql = require('mysql2/promise');

// DB_SSL=true enables SSL - needed for some managed MySQL hosts (Railway's
// included) that offer TLS with a self-signed certificate. rejectUnauthorized
// is set to false because it's self-signed, not because SSL itself is being
// skipped - the connection is still encrypted, just not chain-verified.
const useSSL = process.env.DB_SSL === 'true';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10000, // fail fast (10s) instead of hanging if the DB is unreachable
  ssl: useSSL ? { rejectUnauthorized: false } : undefined,
});

// Runs once at startup so a bad DB_HOST/DB_PASSWORD/etc. shows up clearly
// in the deployment logs immediately, instead of surfacing later as a
// vague "Application failed to respond" on the first real request.
pool.getConnection()
  .then((conn) => {
    console.log(
      'Database connection OK (' + process.env.DB_HOST + ':' + (process.env.DB_PORT || 3306) +
      ', ssl=' + useSSL + ')'
    );
    conn.release();
  })
  .catch((err) => {
    console.error('Database connection FAILED at startup:', err.code || '', err.message);
    console.error('Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME in your environment variables.');
    console.error('If the error mentions SSL/TLS or a handshake, try setting DB_SSL=true.');
  });

module.exports = pool;
