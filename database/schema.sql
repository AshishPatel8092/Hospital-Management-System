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
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    doctor_id       INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL UNIQUE,
    first_name      VARCHAR(80) NOT NULL,
    last_name       VARCHAR(80) NOT NULL,
    department      VARCHAR(100),
    specialization  VARCHAR(150),
    gender          ENUM('Male','Female','Other'),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
-- Seed data: one admin account (change password after first login)
-- Password below is a real bcrypt hash of "Admin@123" (12 rounds)
-- ---------------------------------------------------------------------
INSERT INTO users (full_name, email, password_hash, role, phone)
VALUES ('System Admin', 'admin@medicare.com',
        '$2a$12$RsaCGxrmAbRX63GCmI7rJeNBIY3C4Lw5iUbGRVZ7.1VM0mnKeDET2',
        'ADMIN', '9999999999');

-- Sample doctor (login email: doctor@medicare.com / password: Doctor@123)
INSERT INTO users (full_name, email, password_hash, role, phone)
VALUES ('Ananya Sharma', 'doctor@medicare.com',
        '$2b$12$m8ssGvMtjYOqZ8Ax2m9Jgema1N1OUtfs36gFBkzmB7/EK6Azz/Zce',
        'DOCTOR', '9876500001');
INSERT INTO doctors (user_id, first_name, last_name, department, specialization, gender)
VALUES (LAST_INSERT_ID(), 'Ananya', 'Sharma', 'Cardiology', 'Cardiologist', 'Female');

-- Sample pharmacy stock
INSERT INTO pharmacy_inventory (item_name, category, quantity, unit_price, expiry_date, supplier, reorder_level)
VALUES
('Paracetamol 500mg', 'Tablet', 500, 1.50, '2027-06-30', 'MedSupply Co.', 50),
('Amoxicillin 250mg', 'Capsule', 200, 4.00, '2027-01-15', 'MedSupply Co.', 30),
('ORS Sachet', 'Sachet', 300, 8.00, '2028-03-01', 'HealthPlus Distributors', 40);
