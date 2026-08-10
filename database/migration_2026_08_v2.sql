-- =====================================================================
-- Incremental migration (version-safe) - run this against your EXISTING
-- Railway MySQL database. Does NOT drop or recreate anything, so your
-- existing users/patients/doctors/appointments are kept.
--
-- Unlike migration_2026_08.sql, this does NOT rely on "ADD COLUMN IF NOT
-- EXISTS" (which only works on MySQL 8.0.29+) - it uses a small stored
-- procedure with an INFORMATION_SCHEMA check instead, which works on
-- older MySQL and MariaDB too. Safe to run more than once.
-- =====================================================================

DELIMITER $$

DROP PROCEDURE IF EXISTS _hms_add_column_if_missing $$
CREATE PROCEDURE _hms_add_column_if_missing(
    IN p_table VARCHAR(64),
    IN p_column VARCHAR(64),
    IN p_definition VARCHAR(255)
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

CALL _hms_add_column_if_missing('doctors', 'qualifications', 'VARCHAR(255) NULL');
CALL _hms_add_column_if_missing('doctors', 'experience_years', 'INT NULL');
CALL _hms_add_column_if_missing('doctors', 'consultation_fee', 'DECIMAL(10,2) NULL');
CALL _hms_add_column_if_missing('doctors', 'clinic_location', 'VARCHAR(255) NULL');
CALL _hms_add_column_if_missing('doctors', 'bio', 'TEXT NULL');

DROP PROCEDURE IF EXISTS _hms_add_column_if_missing;

-- CREATE TABLE IF NOT EXISTS is supported everywhere, no compatibility issue here.

CREATE TABLE IF NOT EXISTS prescriptions (
    prescription_id  INT AUTO_INCREMENT PRIMARY KEY,
    patient_id        INT NOT NULL,
    doctor_id         INT NOT NULL,
    appointment_id    INT NULL,
    medication_name   VARCHAR(150) NOT NULL,
    dosage            VARCHAR(100),
    instructions      VARCHAR(255),
    prescribed_date   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rx_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    CONSTRAINT fk_rx_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    CONSTRAINT fk_rx_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS contact_messages (
    message_id   INT AUTO_INCREMENT PRIMARY KEY,
    full_name    VARCHAR(150) NOT NULL,
    email        VARCHAR(150) NOT NULL,
    phone        VARCHAR(20),
    message      TEXT NOT NULL,
    status       ENUM('New','Contacted','Resolved') DEFAULT 'New',
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS demo_requests (
    request_id          INT AUTO_INCREMENT PRIMARY KEY,
    full_name           VARCHAR(150) NOT NULL,
    email               VARCHAR(150) NOT NULL,
    phone               VARCHAR(20),
    requirement_text    TEXT NOT NULL,
    matched_department  VARCHAR(100),
    matched_doctor_id   INT NULL,
    preferred_date      DATE,
    preferred_time      VARCHAR(50),
    appointment_id      INT NULL,
    status              ENUM('New','Contacted','Resolved') DEFAULT 'New',
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_demo_doctor FOREIGN KEY (matched_doctor_id) REFERENCES doctors(doctor_id) ON DELETE SET NULL,
    CONSTRAINT fk_demo_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Confirm what's actually on the server after running this - compare
-- against the column/table names above. If qualifications/experience_years/
-- consultation_fee/clinic_location/bio are NOT in the first result, and
-- prescriptions/contact_messages/demo_requests are NOT in the second,
-- something in this script failed silently - scroll up for the error.
SHOW COLUMNS FROM doctors;
SHOW TABLES;
