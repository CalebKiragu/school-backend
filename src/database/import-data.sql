-- Import data from db.sql into the existing database
-- This script will populate the database with test data

-- Insert data into user table
INSERT IGNORE INTO user (id, email, school_name, school_id, phone, population, role, logo, password, last_login, status, date_modified, date_registered) VALUES
(1, 'sigalame@gmail.com', 'Sigalame Boys', '35623105', '0724941854', 288, '', '1503392856162.png', '824a368645a6cf4488fdb1525bbf18d8', '', '1', '0000-00-00 00:00:00', '2017-09-04 08:00:00');

-- Insert data into stakeholders table
INSERT IGNORE INTO stakeholders (id, name, category, role, phone1, phone2, school_id, date_posted) VALUES
(5, 'MR WERE', 'BOM', 'Principal', '254715648891', '', 35623105, '2017-08-20 02:56:44'),
(6, 'JAMES KAMAU', 'Teachers', 'Admin', '254714732457', '', 35623105, '2017-08-20 02:56:44'),
(7, 'TITUS MARTIN', 'Teachers', 'Class Teacher', '254701065011', '', 35623105, '2017-08-31 21:59:48');

-- Insert data into student_contacts table
INSERT IGNORE INTO student_contacts (id, adm, student_name, parent_phone1, parent_phone2, stream, class, school_id, date_posted) VALUES
(1, 3262, 'MARTIN WAMALWA', '254713671716', '254724027217', '1G', 'FORM1', 35623105, '2017-08-29 19:24:58'),
(2, 3263, 'TOM KIMANI', '254721816968', '254712918887', '1G', 'FORM1', 35623105, '2017-08-29 19:24:59'),
(3, 3266, 'BOB OUMA', '254717411185', '254720542641', '1G', 'FORM1', 35623105, '2017-08-29 19:24:59'),
(4, 3268, 'MIKE BARAZA', '254710117977', '254721590136', '1G', 'FORM1', 35623105, '2017-08-29 19:24:59'),
(5, 3270, 'KEVIN OMONDI', '254719117637', '254728986084', '1G', 'FORM1', 35623105, '2017-08-29 19:24:59');

-- Insert data into fee_payments table
INSERT IGNORE INTO fee_payments (id, adm, student_name, fee_balance, stream, class, school_id, date_posted) VALUES
(1, 3262, 'MARTIN WAMALWA', 1200, '1G', 'FORM1', 35623105, '2019-02-19 20:05:26'),
(2, 3263, 'TOM KIMANI', 0, '1G', 'FORM1', 35623105, '2019-02-19 20:05:26'),
(3, 3266, 'BOB OUMA', 0, '1G', 'FORM1', 35623105, '2019-02-19 20:05:26'),
(4, 3268, 'MIKE BARAZA', 0, '1G', 'FORM1', 35623105, '2019-02-19 20:05:26'),
(5, 3270, 'KEVIN OMONDI', 3560, '1G', 'FORM1', 35623105, '2019-02-19 20:05:26');

-- Insert data into exam_results table
INSERT IGNORE INTO exam_results (id, adm, student_name, exam_name, results, stream, class, school_id, date_posted) VALUES
(1, '3262', 'MARTIN WAMALWA', 'CAT1', 'ENG:45KIS:66MAT:76BIO:23PHY:66CHEM:76CRE:78AGR:66ENTRY:8', '1G', 'FORM1', 35623105, '2019-02-24 21:50:56'),
(2, '3263', 'TOM KIMANI', 'CAT1', 'ENG:59KIS:45MAT:45BIO:70CHEM:45GEO:45HSC:45ENTRY:7', '1G', 'FORM1', 35623105, '2019-02-24 21:50:56'),
(3, '3266', 'BOB OUMA', 'CAT1', 'ENG:70KIS:81MAT:24BIO:70PHY:80CHEM:24GEO:40COMP:44ENTRY:8', '1G', 'FORM1', 35623105, '2019-02-24 21:50:56'),
(4, '3268', 'MIKE BARAZA', 'CAT1', 'ENG:67KIS:34MAT:76BIO:67CHEM:76GEO:70HSC:34ENTRY:7', '1G', 'FORM1', 35623105, '2019-02-24 21:50:56'),
(5, '3270', 'KEVIN OMONDI', 'CAT1', 'ENG:70KIS:87MAT:76BIO:70PHY:87CHEM:76GEO:56COMP:76ENTRY:8', '1G', 'FORM1', 35623105, '2019-02-24 21:50:56');

-- Insert data into fee_structure table
INSERT IGNORE INTO fee_structure (id, class, term1, term2, term3, total, school_id, date_posted) VALUES
(5, 'FORM1', 22194, 14063, 9244, 45501, 35623105, '2017-08-20 02:59:55'),
(6, 'FORM2', 22194, 14063, 9244, 45501, 35623105, '2017-08-20 02:59:55'),
(7, 'FORM3', 22194, 14063, 9244, 45501, 35623105, '2017-08-20 02:59:55'),
(8, 'FORM4', 22194, 14063, 9244, 45501, 35623105, '2017-08-20 02:59:55');

-- Insert data into payment_instructions table
INSERT IGNORE INTO payment_instructions (id, description, school_id, date_posted) VALUES
(1, 'Parents are asked to pay fees by bankers cheque, money order payable to Sigalame Boys or deposit in the school account No. 010210365017-00 National Bank of Kenya', 35623105, '2017-08-20 00:47:03');

-- Insert data into upcoming_events table
INSERT IGNORE INTO upcoming_events (id, event_name, event_details, start_date, end_date, school_id, date_posted) VALUES
(153, 'CAT 1 Exams', 'Beginning of CAT 1 Exams', '2026-04-12', '2026-04-12', '35623105', '2019-02-16 13:16:02'),
(154, 'Opening Date', 'Students to resume learning', '2026-04-12', '2026-04-12', '35623105', '2019-02-16 13:16:02'),
(155, 'End year Exams', 'Beginning of End Term exams F1-F3', '2026-04-12', '2026-04-12', '35623105', '2019-02-16 13:16:02');

-- Insert some session_levels data for testing
INSERT IGNORE INTO session_levels (session_id, phoneNumber, level) VALUES
('ATUid_test_session_1', '+254724027217', 1),
('ATUid_test_session_2', '+254728986084', 1),
('ATUid_test_session_3', '+254715648891', 1),
('ATUid_test_session_4', '+254714732457', 1);