-- Run against your EXISTING Railway database. Adds the feedback table
-- used by the footer "Give Feedback" button. Safe to run more than once.

CREATE TABLE IF NOT EXISTS feedback_responses (
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
