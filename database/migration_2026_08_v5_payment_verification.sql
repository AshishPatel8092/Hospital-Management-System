-- =====================================================================
-- Run this against your EXISTING database. Safe to run more than once
-- (guarded with a column-existence check below).
--
-- Adds real payment verification: every bill marked "Paid" now stores
-- the UPI transaction reference (UTR) the payer entered after actually
-- completing the payment in their UPI app. This is what closes the old
-- "click Paid without paying" gap - the backend now refuses to mark a
-- bill Paid unless a plausible 12-digit UTR is supplied.
-- =====================================================================

SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'billing' AND COLUMN_NAME = 'transaction_ref'
);

SET @sql := IF(@col_exists = 0,
  'ALTER TABLE billing ADD COLUMN transaction_ref VARCHAR(30) NULL AFTER payment_method',
  'SELECT "transaction_ref already exists, skipping"'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
