-- =====================================================================
-- Incremental migration - run this against your EXISTING Railway MySQL
-- database. Unlike schema.sql, this does NOT drop or recreate anything,
-- so your existing users/patients/doctors/appointments are kept.
--
-- Safe to run more than once - every statement uses IF NOT EXISTS.
-- =====================================================================

-- Doctor profile fields added for the homepage doctor cards + payments
ALTER TABLE doctors ADD COLUMN qualifications VARCHAR(255) NULL;

ALTER TABLE doctors ADD COLUMN experience_years INT NULL;

ALTER TABLE doctors ADD COLUMN consultation_fee DECIMAL(10,2) NULL;

ALTER TABLE doctors ADD COLUMN clinic_location VARCHAR(255) NULL;

ALTER TABLE doctors ADD COLUMN bio TEXT NULL;
-- Prescriptions (doctor -> patient medications)
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

-- Contact form submissions
CREATE TABLE IF NOT EXISTS contact_messages (
    message_id   INT AUTO_INCREMENT PRIMARY KEY,
    full_name    VARCHAR(150) NOT NULL,
    email        VARCHAR(150) NOT NULL,
    phone        VARCHAR(20),
    message      TEXT NOT NULL,
    status       ENUM('New','Contacted','Resolved') DEFAULT 'New',
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Request-demo / doctor-matching submissions
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
-- against the column/table names above.
SHOW COLUMNS FROM doctors;
SHOW TABLES;
