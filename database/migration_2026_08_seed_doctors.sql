-- =====================================================================
-- Adds 7 more real, bookable doctor accounts (on top of the existing
-- Ananya Sharma one) so the homepage carousel has a full roster again.
-- Run this against your EXISTING Railway database - it does not touch
-- any existing rows. Safe to run more than once: INSERT IGNORE skips
-- any email that already exists (email is a UNIQUE column on users).
--
-- All seven share the password Doctor@123 - encourage anyone using
-- these to change it after logging in.
-- =====================================================================

INSERT IGNORE INTO users (full_name, email, password_hash, role, phone) VALUES
('Raj Sharma', 'raj.sharma@medicare.com', '$2b$12$jQnnMvN55lU5ySebWwvPEOAbmJiwhAD.1d1m6JlbBRDPam3oSnCVe', 'DOCTOR', '9876500002'),
('Priya Singh', 'priya.singh@medicare.com', '$2b$12$jQnnMvN55lU5ySebWwvPEOAbmJiwhAD.1d1m6JlbBRDPam3oSnCVe', 'DOCTOR', '9876500003'),
('Amit Kumar', 'amit.kumar@medicare.com', '$2b$12$jQnnMvN55lU5ySebWwvPEOAbmJiwhAD.1d1m6JlbBRDPam3oSnCVe', 'DOCTOR', '9876500004'),
('Neha Gupta', 'neha.gupta@medicare.com', '$2b$12$jQnnMvN55lU5ySebWwvPEOAbmJiwhAD.1d1m6JlbBRDPam3oSnCVe', 'DOCTOR', '9876500005'),
('Vikram Patel', 'vikram.patel@medicare.com', '$2b$12$jQnnMvN55lU5ySebWwvPEOAbmJiwhAD.1d1m6JlbBRDPam3oSnCVe', 'DOCTOR', '9876500006'),
('Rahul Das', 'rahul.das@medicare.com', '$2b$12$jQnnMvN55lU5ySebWwvPEOAbmJiwhAD.1d1m6JlbBRDPam3oSnCVe', 'DOCTOR', '9876500007'),
('Arjun Verma', 'arjun.verma@medicare.com', '$2b$12$jQnnMvN55lU5ySebWwvPEOAbmJiwhAD.1d1m6JlbBRDPam3oSnCVe', 'DOCTOR', '9876500008');

INSERT IGNORE INTO doctors (user_id, first_name, last_name, department, specialization, gender, qualifications, experience_years, consultation_fee, clinic_location, bio)
SELECT user_id, 'Raj', 'Sharma', 'General Medicine', 'General Physician', 'Male',
       'MBBS', 6, 500.00, 'Casto Healthcare, Ground Floor',
       'General health checkups, fever, infections, and routine consultations.'
FROM users WHERE email = 'raj.sharma@medicare.com';

INSERT IGNORE INTO doctors (user_id, first_name, last_name, department, specialization, gender, qualifications, experience_years, consultation_fee, clinic_location, bio)
SELECT user_id, 'Priya', 'Singh', 'General Medicine', 'Diagnostic Physician', 'Female',
       'MBBS, DMRD', 8, 700.00, 'Casto Healthcare, Imaging Wing',
       'Expert in diagnostic imaging including X-Ray, CT, and MRI interpretation.'
FROM users WHERE email = 'priya.singh@medicare.com';

INSERT IGNORE INTO doctors (user_id, first_name, last_name, department, specialization, gender, qualifications, experience_years, consultation_fee, clinic_location, bio)
SELECT user_id, 'Amit', 'Kumar', 'Cardiology', 'Cardiologist', 'Male',
       'MBBS, MD (Cardiology)', 12, 900.00, 'Casto Healthcare, Block A',
       'Expert in heart rhythm, cardiac care, and coronary interventions.'
FROM users WHERE email = 'amit.kumar@medicare.com';

INSERT IGNORE INTO doctors (user_id, first_name, last_name, department, specialization, gender, qualifications, experience_years, consultation_fee, clinic_location, bio)
SELECT user_id, 'Neha', 'Gupta', 'Neurology', 'Neurologist', 'Female',
       'MBBS, DM (Neurology)', 10, 1000.00, 'Casto Healthcare, NeuroCare Center',
       'Specializes in neurological disorders, migraines, and cognitive health.'
FROM users WHERE email = 'neha.gupta@medicare.com';

INSERT IGNORE INTO doctors (user_id, first_name, last_name, department, specialization, gender, qualifications, experience_years, consultation_fee, clinic_location, bio)
SELECT user_id, 'Vikram', 'Patel', 'General Medicine', 'Gastroenterologist', 'Male',
       'MBBS, MD (Gastroenterology)', 11, 800.00, 'Casto Healthcare, Digestive Clinic',
       'Focused on digestive disorders, endoscopy, and liver health.'
FROM users WHERE email = 'vikram.patel@medicare.com';

INSERT IGNORE INTO doctors (user_id, first_name, last_name, department, specialization, gender, qualifications, experience_years, consultation_fee, clinic_location, bio)
SELECT user_id, 'Rahul', 'Das', 'Orthopaedics', 'Orthopaedic Surgeon', 'Male',
       'MBBS, MS (Surgery)', 14, 1200.00, 'Casto Healthcare, Surgical Center',
       'Experienced in general and minimally invasive orthopaedic surgical procedures.'
FROM users WHERE email = 'rahul.das@medicare.com';

INSERT IGNORE INTO doctors (user_id, first_name, last_name, department, specialization, gender, qualifications, experience_years, consultation_fee, clinic_location, bio)
SELECT user_id, 'Arjun', 'Verma', 'Dermatology', 'Dermatologist', 'Male',
       'MBBS, MD (Dermatology)', 11, 750.00, 'Casto Healthcare, SkinCare Clinic',
       'Expert in skin conditions, acne treatment, and cosmetic dermatology.'
FROM users WHERE email = 'arjun.verma@medicare.com';

SELECT first_name, last_name, department, email FROM doctors d JOIN users u ON u.user_id = d.user_id;
