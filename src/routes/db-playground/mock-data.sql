-- Delete existing data
DELETE FROM meal_checkins;
DELETE FROM travel_tickets;
DELETE FROM entry_exit_logs;
DELETE FROM complaints;
DELETE FROM users WHERE email != 'admin@dorm.com';

-- Insert Students
INSERT INTO users (name, email, password, phoneNumber, role) VALUES
('John Smith', 'john.smith@student.edu', '123456', '+1234567890', 'Student'),
('Emma Wilson', 'emma.w@student.edu', '123456', '+1234567891', 'Student'),
('Michael Chen', 'michael.c@student.edu', '123456', '+1234567892', 'Student'),
('Sarah Johnson', 'sarah.j@student.edu', '123456', '+1234567893', 'Student'),
('Raj Patel', 'raj.p@student.edu', '123456', '+1234567894', 'Student'),
('Maria Garcia', 'maria.g@student.edu', '123456', '+1234567895', 'Student'),
('James Wilson', 'james.w@student.edu', '123456', '+1234567896', 'Student'),
('Lisa Anderson', 'lisa.a@student.edu', '123456', '+1234567897', 'Student'),
('David Kim', 'david.k@student.edu', '123456', '+1234567898', 'Student'),
('Sophie Martin', 'sophie.m@student.edu', '123456', '+1234567899', 'Student');

-- Insert Security Staff
INSERT INTO users (name, email, password, phoneNumber, role) VALUES
('Robert Brown', 'robert.b@security.edu', '123456', '+1234567800', 'Security'),
('Amanda White', 'amanda.w@security.edu', '123456', '+1234567801', 'Security'),
('Carlos Rodriguez', 'carlos.r@security.edu', '123456', '+1234567802', 'Security');

-- Insert Chefs
INSERT INTO users (name, email, password, phoneNumber, role) VALUES
('Chef Gordon', 'gordon@kitchen.edu', '123456', '+1234567700', 'Chef'),
('Chef Julia', 'julia@kitchen.edu', '123456', '+1234567701', 'Chef'),
('Chef Marco', 'marco@kitchen.edu', '123456', '+1234567702', 'Chef');

-- Insert Complaints (past 7 days)
INSERT INTO complaints (userId, description, submittedTime) VALUES
(2, 'Wi-Fi connection is unstable in Room 203', datetime('now', '-6 days')),
(3, 'Hot water not working in 3rd floor shower room', datetime('now', '-5 days')),
(4, 'Air conditioning making loud noise in Room 405', datetime('now', '-4 days')),
(5, 'Common room TV remote is missing', datetime('now', '-3 days')),
(6, 'Vending machine on 2nd floor not accepting cards', datetime('now', '-2 days')),
(7, 'Light bulb needs replacement in study room 2', datetime('now', '-1 day')),
(8, 'Washing machine #3 not spinning properly', datetime('now', '-12 hours')),
(9, 'Kitchen microwave stopped working', datetime('now', '-6 hours')),
(10, 'Elevator making strange noises', datetime('now', '-2 hours'));

-- Insert Travel Tickets (mix of past, current, and future)
INSERT INTO travel_tickets (studentId, requestTime, startTime, endTime, status, adminId) VALUES
(2, datetime('now', '-10 days'), datetime('now', '-8 days'), datetime('now', '-6 days'), 'Approved', 1),
(3, datetime('now', '-7 days'), datetime('now', '-5 days'), datetime('now', '-3 days'), 'Approved', 1),
(4, datetime('now', '-5 days'), datetime('now', '-2 days'), datetime('now', '+1 day'), 'Approved', 1),
(5, datetime('now', '-3 days'), datetime('now', '+1 day'), datetime('now', '+3 days'), 'Pending', NULL),
(6, datetime('now', '-2 days'), datetime('now', '+2 days'), datetime('now', '+4 days'), 'Pending', NULL),
(7, datetime('now', '-1 day'), datetime('now', '+5 days'), datetime('now', '+7 days'), 'Pending', NULL),
(8, datetime('now', '-15 days'), datetime('now', '-14 days'), datetime('now', '-12 days'), 'Rejected', 1),
(9, datetime('now', '-8 days'), datetime('now', '-7 days'), datetime('now', '-5 days'), 'Approved', 1),
(10, datetime('now'), datetime('now', '+10 days'), datetime('now', '+12 days'), 'Pending', NULL);

-- Insert Entry/Exit Logs (past 24 hours)
INSERT INTO entry_exit_logs (studentId, securityId, entryTime, exitTime) VALUES
-- Yesterday's logs
(2, 13, datetime('now', '-1 day', '+8 hours'), datetime('now', '-1 day', '+10 hours')),
(3, 13, datetime('now', '-1 day', '+9 hours'), datetime('now', '-1 day', '+14 hours')),
(4, 14, datetime('now', '-1 day', '+10 hours'), datetime('now', '-1 day', '+16 hours')),
(5, 14, datetime('now', '-1 day', '+11 hours'), datetime('now', '-1 day', '+18 hours')),
-- Today's logs
(6, 15, datetime('now', '-6 hours'), datetime('now', '-4 hours')),
(7, 13, datetime('now', '-5 hours'), datetime('now', '-3 hours')),
(8, 14, datetime('now', '-4 hours'), datetime('now', '-2 hours')),
(9, 15, datetime('now', '-3 hours'), NULL), -- Still outside
(10, 13, datetime('now', '-2 hours'), NULL); -- Still outside

-- Insert Meal Checkins (past 24 hours)
INSERT INTO meal_checkins (studentId, chefId, checkInTime) VALUES
-- Yesterday's dinner
(2, 16, datetime('now', '-1 day', '+18 hours')),
(3, 16, datetime('now', '-1 day', '+18 hours', '+5 minutes')),
(4, 16, datetime('now', '-1 day', '+18 hours', '+10 minutes')),
(5, 16, datetime('now', '-1 day', '+18 hours', '+15 minutes')),
(6, 16, datetime('now', '-1 day', '+18 hours', '+20 minutes')),
-- Today's breakfast
(7, 17, datetime('now', '-8 hours')),
(8, 17, datetime('now', '-8 hours', '+5 minutes')),
(9, 17, datetime('now', '-8 hours', '+10 minutes')),
(10, 17, datetime('now', '-8 hours', '+15 minutes')),
-- Today's lunch
(2, 18, datetime('now', '-2 hours')),
(3, 18, datetime('now', '-2 hours', '+5 minutes')),
(4, 18, datetime('now', '-2 hours', '+10 minutes')),
(5, 18, datetime('now', '-2 hours', '+15 minutes')); 