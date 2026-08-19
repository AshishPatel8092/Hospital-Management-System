-- =====================================================================
-- MediCare / Casto Healthcare - Hospital Management System
-- MySQL 8.0 Schema
-- =====================================================================

DROP DATABASE IF EXISTS hms_db;
CREATE DATABASE hms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hms_db;

-- ---------------------------------------------------------------------
-- USERS  (login + role for RBAC)
-- ---------------------------------------------------------------------
CREATE TABLE users (
    user_id        INT AUTO_INCREMENT PRIMARY KEY,
    full_name      VARCHAR(150) NOT NULL,
    email          VARCHAR(150) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    role           ENUM('ADMIN','DOCTOR','NURSE','PATIENT') NOT NULL,
    phone          VARCHAR(20),
    is_active      TINYINT(1) NOT NULL DEFAULT 1,
    email_verified       TINYINT(1) NOT NULL DEFAULT 0,
    verification_code     VARCHAR(10) NULL,
    verification_expires   DATETIME NULL,
    twofa_code               VARCHAR(10) NULL,
    twofa_expires             DATETIME NULL,
    reset_code                 VARCHAR(10) NULL,
    reset_expires                DATETIME NULL,
    failed_login_attempts          INT NOT NULL DEFAULT 0,
    lockout_until                    DATETIME NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- MEDICAL REGISTRATION NUMBERS  (a pre-approved allowlist - anyone
-- registering as a doctor must supply one of these, and each number can
-- only be used once. Simulates verifying against a real medical council
-- registry, which this project doesn't have access to.)
-- ---------------------------------------------------------------------
CREATE TABLE medical_registration_numbers (
    registration_number  VARCHAR(50) PRIMARY KEY,
    is_used               TINYINT(1) NOT NULL DEFAULT 0,
    used_by_user_id        INT NULL,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_regnum_user FOREIGN KEY (used_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- PATIENTS  (1-1 with users where role = PATIENT)
-- ---------------------------------------------------------------------
CREATE TABLE patients (
    patient_id       INT AUTO_INCREMENT PRIMARY KEY,
    user_id          INT NOT NULL UNIQUE,
    first_name       VARCHAR(80) NOT NULL,
    last_name        VARCHAR(80) NOT NULL,
    gender           ENUM('Male','Female','Other'),
    dob              DATE,
    blood_group      VARCHAR(5),
    guardian_name    VARCHAR(150),
    address          VARCHAR(255),
    country          VARCHAR(80),
    medical_history  TEXT,
    smoking_status   VARCHAR(20),
    alcohol_status   VARCHAR(20),
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_patient_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- DOCTORS  (1-1 with users where role = DOCTOR)
-- ---------------------------------------------------------------------
CREATE TABLE doctors (
    doctor_id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id             INT NOT NULL UNIQUE,
    first_name          VARCHAR(80) NOT NULL,
    last_name           VARCHAR(80) NOT NULL,
    department          VARCHAR(100),
    specialization      VARCHAR(150),
    gender              ENUM('Male','Female','Other'),
    qualifications      VARCHAR(255),
    experience_years    INT,
    consultation_fee    DECIMAL(10,2),
    clinic_location     VARCHAR(255),
    bio                 TEXT,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_doctor_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- APPOINTMENTS
-- ---------------------------------------------------------------------
CREATE TABLE appointments (
    appointment_id    INT AUTO_INCREMENT PRIMARY KEY,
    patient_id        INT NOT NULL,
    doctor_id         INT NOT NULL,
    appointment_date  DATE NOT NULL,
    slot_time         VARCHAR(50),
    visit_type        ENUM('In-person','Video consultation','Home visit') DEFAULT 'In-person',
    reason            VARCHAR(255),
    status            ENUM('Pending','Confirmed','Completed','Cancelled') DEFAULT 'Pending',
    created_by        INT NOT NULL,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_appt_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    CONSTRAINT fk_appt_doctor  FOREIGN KEY (doctor_id)  REFERENCES doctors(doctor_id)  ON DELETE CASCADE,
    CONSTRAINT fk_appt_creator FOREIGN KEY (created_by) REFERENCES users(user_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- BILLING
-- ---------------------------------------------------------------------
CREATE TABLE billing (
    bill_id          INT AUTO_INCREMENT PRIMARY KEY,
    patient_id       INT NOT NULL,
    appointment_id   INT NULL,
    description      VARCHAR(255) NOT NULL,
    amount           DECIMAL(10,2) NOT NULL,
    payment_method   VARCHAR(50),
    payment_status   ENUM('Pending','Paid','Failed') DEFAULT 'Pending',
    billing_date     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bill_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    CONSTRAINT fk_bill_appt    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- PHARMACY INVENTORY
-- ---------------------------------------------------------------------
CREATE TABLE pharmacy_inventory (
    item_id        INT AUTO_INCREMENT PRIMARY KEY,
    item_name      VARCHAR(150) NOT NULL,
    category       VARCHAR(80),
    quantity       INT NOT NULL DEFAULT 0,
    unit_price     DECIMAL(10,2) NOT NULL,
    expiry_date    DATE,
    supplier       VARCHAR(150),
    reorder_level  INT DEFAULT 10,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- PRESCRIPTIONS  (a doctor records medication for a patient they've seen)
-- ---------------------------------------------------------------------
CREATE TABLE prescriptions (
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

-- ---------------------------------------------------------------------
-- CONTACT MESSAGES  (from contact.html - anyone can submit, no login needed)
-- ---------------------------------------------------------------------
CREATE TABLE contact_messages (
    message_id   INT AUTO_INCREMENT PRIMARY KEY,
    full_name    VARCHAR(150) NOT NULL,
    email        VARCHAR(150) NOT NULL,
    phone        VARCHAR(20),
    message      TEXT NOT NULL,
    status       ENUM('New','Contacted','Resolved') DEFAULT 'New',
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- DEMO REQUESTS  (from request-demo.html - matches the visitor's stated
-- need to a real doctor/department; if the visitor is logged in as a
-- patient, a real row in `appointments` is also created and linked here)
-- ---------------------------------------------------------------------
CREATE TABLE demo_requests (
    request_id         INT AUTO_INCREMENT PRIMARY KEY,
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

-- ---------------------------------------------------------------------
-- Seed data: one admin account (change password after first login)
-- Password below is a real bcrypt hash of "Admin@123" (12 rounds)
-- ---------------------------------------------------------------------
INSERT INTO users (full_name, email, password_hash, role, phone, email_verified)
VALUES ('System Admin', 'admin@medicare.com',
        '$2a$12$RsaCGxrmAbRX63GCmI7rJeNBIY3C4Lw5iUbGRVZ7.1VM0mnKeDET2',
        'ADMIN', '9999999999', 1);

-- Sample doctor (login email: doctor@medicare.com / password: Doctor@123)
INSERT INTO users (full_name, email, password_hash, role, phone, email_verified)
VALUES ('Ananya Sharma', 'doctor@medicare.com',
        '$2b$12$m8ssGvMtjYOqZ8Ax2m9Jgema1N1OUtfs36gFBkzmB7/EK6Azz/Zce',
        'DOCTOR', '9876500001', 1);
INSERT INTO doctors (user_id, first_name, last_name, department, specialization, gender, qualifications, experience_years, consultation_fee, clinic_location, bio)
VALUES (LAST_INSERT_ID(), 'Ananya', 'Sharma', 'Cardiology', 'Cardiologist', 'Female',
        'MBBS, MD (Cardiology)', 9, 700.00, 'Casto Healthcare, Main Building, 2nd Floor',
        'Dr. Ananya Sharma specializes in interventional cardiology and preventive heart care.');

-- Seven more seed doctors so the homepage carousel has a full roster of
-- real, bookable doctors instead of decorative cards. All share the
-- password Doctor@123 (same hash as above) - change these before any
-- real deployment.
INSERT INTO users (full_name, email, password_hash, role, phone, email_verified) VALUES
('Raj Sharma', 'raj.sharma@medicare.com', '$2b$12$jQnnMvN55lU5ySebWwvPEOAbmJiwhAD.1d1m6JlbBRDPam3oSnCVe', 'DOCTOR', '9876500002', 1),
('Priya Singh', 'priya.singh@medicare.com', '$2b$12$jQnnMvN55lU5ySebWwvPEOAbmJiwhAD.1d1m6JlbBRDPam3oSnCVe', 'DOCTOR', '9876500003', 1),
('Amit Kumar', 'amit.kumar@medicare.com', '$2b$12$jQnnMvN55lU5ySebWwvPEOAbmJiwhAD.1d1m6JlbBRDPam3oSnCVe', 'DOCTOR', '9876500004', 1),
('Neha Gupta', 'neha.gupta@medicare.com', '$2b$12$jQnnMvN55lU5ySebWwvPEOAbmJiwhAD.1d1m6JlbBRDPam3oSnCVe', 'DOCTOR', '9876500005', 1),
('Vikram Patel', 'vikram.patel@medicare.com', '$2b$12$jQnnMvN55lU5ySebWwvPEOAbmJiwhAD.1d1m6JlbBRDPam3oSnCVe', 'DOCTOR', '9876500006', 1),
('Rahul Das', 'rahul.das@medicare.com', '$2b$12$jQnnMvN55lU5ySebWwvPEOAbmJiwhAD.1d1m6JlbBRDPam3oSnCVe', 'DOCTOR', '9876500007', 1),
('Arjun Verma', 'arjun.verma@medicare.com', '$2b$12$jQnnMvN55lU5ySebWwvPEOAbmJiwhAD.1d1m6JlbBRDPam3oSnCVe', 'DOCTOR', '9876500008', 1);

INSERT INTO doctors (user_id, first_name, last_name, department, specialization, gender, qualifications, experience_years, consultation_fee, clinic_location, bio)
SELECT user_id, 'Raj', 'Sharma', 'General Medicine', 'General Physician', 'Male',
       'MBBS', 6, 500.00, 'Casto Healthcare, Ground Floor',
       'General health checkups, fever, infections, and routine consultations.'
FROM users WHERE email = 'raj.sharma@medicare.com';

INSERT INTO doctors (user_id, first_name, last_name, department, specialization, gender, qualifications, experience_years, consultation_fee, clinic_location, bio)
SELECT user_id, 'Priya', 'Singh', 'Radiology', 'Diagnostic Radiologist', 'Female',
       'MBBS, DMRD', 8, 700.00, 'Casto Healthcare, Imaging Wing',
       'Expert in diagnostic imaging including X-Ray, CT, and MRI interpretation.'
FROM users WHERE email = 'priya.singh@medicare.com';

INSERT INTO doctors (user_id, first_name, last_name, department, specialization, gender, qualifications, experience_years, consultation_fee, clinic_location, bio)
SELECT user_id, 'Amit', 'Kumar', 'Cardiology', 'Cardiologist', 'Male',
       'MBBS, MD (Cardiology)', 12, 900.00, 'Casto Healthcare, Block A',
       'Expert in heart rhythm, cardiac care, and coronary interventions.'
FROM users WHERE email = 'amit.kumar@medicare.com';

INSERT INTO doctors (user_id, first_name, last_name, department, specialization, gender, qualifications, experience_years, consultation_fee, clinic_location, bio)
SELECT user_id, 'Neha', 'Gupta', 'Neurology', 'Neurologist', 'Female',
       'MBBS, DM (Neurology)', 10, 1000.00, 'Casto Healthcare, NeuroCare Center',
       'Specializes in neurological disorders, migraines, and cognitive health.'
FROM users WHERE email = 'neha.gupta@medicare.com';

INSERT INTO doctors (user_id, first_name, last_name, department, specialization, gender, qualifications, experience_years, consultation_fee, clinic_location, bio)
SELECT user_id, 'Vikram', 'Patel', 'Gastroenterology', 'Gastroenterologist', 'Male',
       'MBBS, MD (Gastroenterology)', 11, 800.00, 'Casto Healthcare, Digestive Clinic',
       'Focused on digestive disorders, endoscopy, and liver health.'
FROM users WHERE email = 'vikram.patel@medicare.com';

INSERT INTO doctors (user_id, first_name, last_name, department, specialization, gender, qualifications, experience_years, consultation_fee, clinic_location, bio)
SELECT user_id, 'Rahul', 'Das', 'General Surgery', 'General & Orthopaedic Surgeon', 'Male',
       'MBBS, MS (Surgery)', 14, 1200.00, 'Casto Healthcare, Surgical Center',
       'Experienced in general and minimally invasive surgical procedures.'
FROM users WHERE email = 'rahul.das@medicare.com';

INSERT INTO doctors (user_id, first_name, last_name, department, specialization, gender, qualifications, experience_years, consultation_fee, clinic_location, bio)
SELECT user_id, 'Arjun', 'Verma', 'Ophthalmology', 'Ophthalmologist', 'Male',
       'MBBS, MS (Ophthalmology)', 11, 750.00, 'Casto Healthcare, Vision Care Clinic',
       'Specializes in vision correction, cataract surgery, and eye health screening.'
FROM users WHERE email = 'arjun.verma@medicare.com';

-- Pre-approved medical registration numbers - a real new doctor signing up
-- through the registration form (not one of the 8 seeded above) must enter
-- one of these. Each can only be used once. Change/add more as needed.
INSERT INTO medical_registration_numbers (registration_number) VALUES
('MCI-2024-10234'),
('MCI-2024-10567'),
('MCI-2024-10891'),
('MCI-2024-11023'),
('MCI-2024-11456');

-- ---------------------------------------------------------------------
-- FEEDBACK  (from the footer "Give Feedback" button - anyone can submit,
-- no login needed. q1-q10 are 1-5 ratings, comments is free text.)
-- ---------------------------------------------------------------------
CREATE TABLE feedback_responses (
    feedback_id   INT AUTO_INCREMENT PRIMARY KEY,
    submitted_by  INT NULL,
    q1_navigation       TINYINT NOT NULL,
    q2_booking            TINYINT NOT NULL,
    q3_doctor_info          TINYINT NOT NULL,
    q4_registration           TINYINT NOT NULL,
    q5_design                    TINYINT NOT NULL,
    q6_speed                        TINYINT NOT NULL,
    q7_findability                     TINYINT NOT NULL,
    q8_recommend                          TINYINT NOT NULL,
    q9_billing                               TINYINT NOT NULL,
    q10_overall                                 TINYINT NOT NULL,
    comments      VARCHAR(700),
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedback_user FOREIGN KEY (submitted_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Sample pharmacy stock
INSERT INTO pharmacy_inventory (item_name, category, quantity, unit_price, expiry_date, supplier, reorder_level)
VALUES
('Paracetamol 500mg', 'Tablet', 500, 1.50, '2027-06-30', 'MedSupply Co.', 50),
('Amoxicillin 250mg', 'Capsule', 200, 4.00, '2027-01-15', 'MedSupply Co.', 30),
('ORS Sachet', 'Sachet', 300, 8.00, '2028-03-01', 'HealthPlus Distributors', 40);
