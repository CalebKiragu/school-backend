-- Create database views for USSD functionality

-- Drop existing views if they exist
DROP VIEW IF EXISTS all_contacts_ussd;
DROP VIEW IF EXISTS fee_balance_ussd;
DROP VIEW IF EXISTS exam_results_ussd;
DROP VIEW IF EXISTS events_ussd;
DROP VIEW IF EXISTS fee_structure_ussd;
DROP VIEW IF EXISTS payment_instructions_ussd;

-- Create all_contacts_ussd view
CREATE VIEW all_contacts_ussd AS
SELECT 
  stakeholders.name AS name,
  CONCAT('+', stakeholders.phone1) AS phone1,
  CONCAT('+', stakeholders.phone2) AS phone2,
  stakeholders.category AS category,
  stakeholders.school_id AS school_id,
  user.school_name AS school_name
FROM user 
JOIN stakeholders ON user.school_id = stakeholders.school_id 
WHERE stakeholders.phone1 <> 0

UNION ALL

SELECT 
  student_contacts.student_name AS name,
  CONCAT('+', student_contacts.parent_phone1) AS phone1,
  CONCAT('+', student_contacts.parent_phone2) AS phone2,
  student_contacts.stream AS category,
  student_contacts.school_id AS school_id,
  user.school_name AS school_name
FROM user 
JOIN student_contacts ON user.school_id = student_contacts.school_id 
WHERE student_contacts.parent_phone1 <> 0;

-- Create fee_balance_ussd view
CREATE VIEW fee_balance_ussd AS
SELECT 
  fee_payments.adm AS adm,
  fee_payments.student_name AS student_name,
  fee_payments.fee_balance AS fee_balance,
  fee_payments.class AS class,
  CONCAT('+', student_contacts.parent_phone1) AS parent_phone1,
  CONCAT('+', student_contacts.parent_phone2) AS parent_phone2,
  student_contacts.school_id AS school_id,
  fee_payments.date_posted AS date_posted
FROM fee_payments 
JOIN student_contacts ON student_contacts.school_id = fee_payments.school_id 
  AND fee_payments.adm = student_contacts.adm;

-- Create exam_results_ussd view
CREATE VIEW exam_results_ussd AS
SELECT 
  exam_results.adm AS adm,
  exam_results.student_name AS student_name,
  exam_results.exam_name AS exam_name,
  exam_results.results AS results,
  student_contacts.class AS class,
  CONCAT('+', student_contacts.parent_phone1) AS parent_phone1,
  CONCAT('+', student_contacts.parent_phone2) AS parent_phone2,
  student_contacts.school_id AS school_id,
  exam_results.date_posted AS date_posted
FROM exam_results 
JOIN student_contacts ON student_contacts.school_id = exam_results.school_id 
  AND exam_results.adm = student_contacts.adm;

-- Create events_ussd view
CREATE VIEW events_ussd AS
SELECT 
  upcoming_events.event_name AS event_name,
  upcoming_events.event_details AS event_details,
  upcoming_events.start_date AS start_date,
  upcoming_events.end_date AS end_date,
  all_contacts_ussd.phone1 AS phone1,
  all_contacts_ussd.phone2 AS phone2,
  upcoming_events.school_id AS school_id,
  all_contacts_ussd.school_name AS school_name
FROM upcoming_events 
JOIN all_contacts_ussd ON upcoming_events.school_id = all_contacts_ussd.school_id;

-- Create fee_structure_ussd view
CREATE VIEW fee_structure_ussd AS
SELECT 
  fee_structure.class AS class,
  fee_structure.term1 AS term1,
  fee_structure.term2 AS term2,
  fee_structure.term3 AS term3,
  fee_structure.total AS total,
  fee_structure.date_posted AS date_posted,
  all_contacts_ussd.phone1 AS phone1,
  all_contacts_ussd.phone2 AS phone2,
  fee_structure.school_id AS school_id,
  all_contacts_ussd.school_name AS school_name
FROM fee_structure 
JOIN all_contacts_ussd ON fee_structure.school_id = all_contacts_ussd.school_id;

-- Create payment_instructions_ussd view
CREATE VIEW payment_instructions_ussd AS
SELECT 
  payment_instructions.description AS description,
  all_contacts_ussd.phone1 AS phone1,
  all_contacts_ussd.phone2 AS phone2,
  all_contacts_ussd.school_name AS school_name,
  payment_instructions.school_id AS school_id
FROM payment_instructions 
JOIN all_contacts_ussd ON payment_instructions.school_id = all_contacts_ussd.school_id;