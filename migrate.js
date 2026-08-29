const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// ---------------------------------------------------------------------
// Runs automatically every time the server starts, so a fresh deploy (or
// a restart on a host like Railway) always has an up-to-date schema -
// nobody has to remember to open a DB console and paste in a .sql file
// by hand. Every file listed here has been verified to be safe to run
// repeatedly: they all use CREATE TABLE IF NOT EXISTS, guarded
// ALTER TABLE (either "ADD COLUMN IF NOT EXISTS" or an
// INFORMATION_SCHEMA check), or INSERT IGNORE / conditional UPDATEs. If
// a table or column this migration adds already exists, that specific
// statement is a safe no-op.
//
// database/schema.sql is intentionally NOT in this list - it starts
// with "DROP DATABASE IF EXISTS", which would wipe a live database, and
// it seeds one-time sample data with plain (non-idempotent) INSERTs.
// It's only meant to be run once, by hand, when setting up a brand new
// database. Likewise migration_2026_08_seed_doctors.sql is left out -
// it's optional demo data, not a required schema change.
//
// These files use the classic `DELIMITER $$ ... END $$ DELIMITER ;`
// pattern for defining a temporary stored procedure with a semicolon-
// containing body. DELIMITER is a mysql-CLI-only affordance - it isn't
// real SQL and the server rejects it if sent literally - so it's
// stripped out here, with the "$$" statement terminators it introduced
// turned back into plain ";". The database server's own parser then
// correctly treats the whole CREATE PROCEDURE ... BEGIN ... END as one
// statement regardless, so this is a no-op transformation, not a
// behavior change.
// ---------------------------------------------------------------------
const MIGRATION_FILES = [
  'migration_2026_08.sql',
  'migration_2026_08_v2.sql',
  'migration_2026_08_v3.sql',
  'migration_2026_08_v4.sql',
  'migration_2026_08_feedback.sql',
  'migration_2026_08_v5_payment_verification.sql',
];

function stripDelimiterSyntax(sql) {
  return sql
    .split('\n')
    .filter((line) => !line.trim().toUpperCase().startsWith('DELIMITER'))
    .join('\n')
    .replace(/\$\$/g, ';');
}

async function runMigrations() {
  const useSSL = process.env.DB_SSL === 'true';
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true, // required to run a whole migration file as one query
      connectTimeout: 10000,
      ssl: useSSL ? { rejectUnauthorized: false } : undefined,
    });
  } catch (err) {
    // Don't crash the app over this - db.js already logs a clear
    // connection error, and the very next request will surface it too.
    console.error('[migrate] Could not connect to run migrations:', err.code || '', err.message);
    return;
  }

  console.log('[migrate] Checking for pending schema updates...');
  for (const filename of MIGRATION_FILES) {
    const filePath = path.join(__dirname, 'database', filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`[migrate] ${filename} not found, skipping.`);
      continue;
    }
    const rawSql = fs.readFileSync(filePath, 'utf8');
    const sql = stripDelimiterSyntax(rawSql);
    try {
      await connection.query(sql);
      console.log(`[migrate] ${filename} applied OK.`);
    } catch (err) {
      // Logged, not thrown - one migration failing (e.g. against an
      // unusual DB version) shouldn't stop the others from applying or
      // stop the server from starting.
      console.error(`[migrate] ${filename} FAILED:`, err.message);
    }
  }
  console.log('[migrate] Schema check complete.');

  await connection.end();
}

module.exports = { runMigrations };
