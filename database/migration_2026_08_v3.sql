-- =====================================================================
-- Run this against your EXISTING Railway database. Safe to run more
-- than once. Does two things:
--   1. Realigns 4 of the 8 seed doctors' departments so all 7 real
--      homepage services (Full Body Checkup, Imaging and Radiology,
--      Heart Related, Brain Related, Stomach Related, Surgical Services,
--      Eye Related) have a matching doctor.
--   2. Creates the medical_registration_numbers allowlist table and
--      seeds it with 5 valid numbers, so only someone who has one of
--      these can register as a new doctor going forward.
-- =====================================================================

UPDATE doctors d JOIN users u ON u.user_id = d.user_id
SET d.department = 'Radiology', d.specialization = 'Diagnostic Radiologist'
WHERE u.email = 'priya.singh@medicare.com';

UPDATE doctors d JOIN users u ON u.user_id = d.user_id
SET d.department = 'Gastroenterology'
WHERE u.email = 'vikram.patel@medicare.com';

UPDATE doctors d JOIN users u ON u.user_id = d.user_id
SET d.department = 'General Surgery', d.specialization = 'General & Orthopaedic Surgeon'
WHERE u.email = 'rahul.das@medicare.com';

UPDATE doctors d JOIN users u ON u.user_id = d.user_id
SET d.department = 'Ophthalmology', d.specialization = 'Ophthalmologist',
    d.qualifications = 'MBBS, MS (Ophthalmology)',
    d.clinic_location = 'Casto Healthcare, Vision Care Clinic',
    d.bio = 'Specializes in vision correction, cataract surgery, and eye health screening.'
WHERE u.email = 'arjun.verma@medicare.com';

CREATE TABLE IF NOT EXISTS medical_registration_numbers (
    registration_number  VARCHAR(50) PRIMARY KEY,
    is_used               TINYINT(1) NOT NULL DEFAULT 0,
    used_by_user_id        INT NULL,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_regnum_user FOREIGN KEY (used_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT IGNORE INTO medical_registration_numbers (registration_number) VALUES
('MCI-2024-10234'),
('MCI-2024-10567'),
('MCI-2024-10891'),
('MCI-2024-11023'),
('MCI-2024-11456');

SELECT first_name, last_name, department, specialization FROM doctors d JOIN users u ON u.user_id = d.user_id;
SELECT * FROM medical_registration_numbers;

-- ---------------------------------------------------------------------
-- Auth security columns: email verification, 2FA, password reset,
-- login lockout tracking. Existing accounts (yours + the 8 seed doctors)
-- are marked already-verified so this doesn't lock anyone out.
-- ---------------------------------------------------------------------
DELIMITER $$
DROP PROCEDURE IF EXISTS _hms_add_column_if_missing2 $$
CREATE PROCEDURE _hms_add_column_if_missing2(
    IN p_table VARCHAR(64), IN p_column VARCHAR(64), IN p_definition VARCHAR(255)
)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = p_table AND COLUMN_NAME = p_column
    ) THEN
        SET @ddl = CONCAT('ALTER TABLE ', p_table, ' ADD COLUMN ', p_column, ' ', p_definition);
        PREPARE stmt FROM @ddl;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END $$
DELIMITER ;

CALL _hms_add_column_if_missing2('users', 'email_verified', 'TINYINT(1) NOT NULL DEFAULT 0');
CALL _hms_add_column_if_missing2('users', 'verification_code', 'VARCHAR(10) NULL');
CALL _hms_add_column_if_missing2('users', 'verification_expires', 'DATETIME NULL');
CALL _hms_add_column_if_missing2('users', 'twofa_code', 'VARCHAR(10) NULL');
CALL _hms_add_column_if_missing2('users', 'twofa_expires', 'DATETIME NULL');
CALL _hms_add_column_if_missing2('users', 'reset_code', 'VARCHAR(10) NULL');
CALL _hms_add_column_if_missing2('users', 'reset_expires', 'DATETIME NULL');
CALL _hms_add_column_if_missing2('users', 'failed_login_attempts', 'INT NOT NULL DEFAULT 0');
CALL _hms_add_column_if_missing2('users', 'lockout_until', 'DATETIME NULL');

DROP PROCEDURE IF EXISTS _hms_add_column_if_missing2;

-- Every account that already exists (you, and the 8 seed doctors) is
-- grandfathered in as verified, so this migration doesn't lock anyone
-- who's already registered out of their own account.
UPDATE users SET email_verified = 1 WHERE email_verified = 0;

