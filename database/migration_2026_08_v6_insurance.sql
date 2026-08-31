-- =====================================================================
-- Run this against your EXISTING database (or let migrate.js apply it
-- automatically on the next server restart). Safe to run more than once.
--
-- Stores insurance queries submitted from insurance.html - "Is my policy
-- accepted?", cashless pre-authorization questions, etc. Mirrors
-- contact_messages in shape/spirit, kept as its own table so an admin
-- reviewing insurance questions doesn't have to wade through general
-- contact form submissions.
-- =====================================================================

CREATE TABLE IF NOT EXISTS insurance_queries (
    query_id       INT AUTO_INCREMENT PRIMARY KEY,
    full_name      VARCHAR(150) NOT NULL,
    email          VARCHAR(150) NOT NULL,
    phone          VARCHAR(20),
    insurer_name   VARCHAR(150),
    policy_number  VARCHAR(100),
    message        TEXT NOT NULL,
    status         ENUM('New','Contacted','Resolved') DEFAULT 'New',
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
