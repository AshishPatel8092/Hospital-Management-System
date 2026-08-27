-- =====================================================================
-- Run this against your EXISTING database. Safe to run more than once.
-- Adds double-booking prevention for the homepage "Services" section
-- (Website Design, Full Body Checkup, etc.) - the same protection
-- doctor appointments already get via the app-level check in
-- routes/appointments.js is enforced here at the database level too,
-- for services, since they don't have their own table yet.
-- =====================================================================

CREATE TABLE IF NOT EXISTS service_bookings (
    service_booking_id  INT AUTO_INCREMENT PRIMARY KEY,
    service_name         VARCHAR(150) NOT NULL,
    booking_date          DATE NOT NULL,
    slot_time              VARCHAR(50) NOT NULL,
    guest_name             VARCHAR(150) NULL,
    guest_phone             VARCHAR(20) NULL,
    guest_email              VARCHAR(150) NULL,
    status                    ENUM('Confirmed','Cancelled') DEFAULT 'Confirmed',
    created_at                 TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_service_slot (service_name, booking_date, slot_time)
) ENGINE=InnoDB;
