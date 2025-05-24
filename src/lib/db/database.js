import Database from 'better-sqlite3';

const db = new Database('dorm.db');

// Initialize tables
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phoneNumber TEXT,
        role TEXT NOT NULL CHECK(role IN ('Student', 'Security', 'Chef', 'Admin'))
    );

    CREATE TABLE IF NOT EXISTS meal_checkins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentId INTEGER NOT NULL,
        chefId INTEGER NOT NULL,
        checkInTime DATETIME NOT NULL,
        FOREIGN KEY (studentId) REFERENCES users(id),
        FOREIGN KEY (chefId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS travel_tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentId INTEGER NOT NULL,
        requestTime DATETIME NOT NULL,
        startTime DATETIME NOT NULL,
        endTime DATETIME NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('Pending', 'Approved', 'Rejected')),
        adminId INTEGER,
        FOREIGN KEY (studentId) REFERENCES users(id),
        FOREIGN KEY (adminId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS entry_exit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentId INTEGER NOT NULL,
        securityId INTEGER NOT NULL,
        entryTime DATETIME,
        exitTime DATETIME,
        FOREIGN KEY (studentId) REFERENCES users(id),
        FOREIGN KEY (securityId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS complaints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        description TEXT NOT NULL,
        submittedTime DATETIME NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id)
    );
`);

// Check if admin exists
const adminExists = db.prepare('SELECT 1 FROM users WHERE email = ?').get('admin@dorm.com');

// Create default admin if it doesn't exist
if (!adminExists) {
    // First clear any existing data
    db.exec(`
        DELETE FROM meal_checkins;
        DELETE FROM travel_tickets;
        DELETE FROM entry_exit_logs;
        DELETE FROM complaints;
        DELETE FROM users;
    `);

    // Create admin first to ensure it gets ID 1
    const createDefaultAdmin = db.prepare(`
        INSERT INTO users (name, email, password, role)
        VALUES (?, ?, ?, ?)
    `);
    createDefaultAdmin.run('Admin User', 'admin@dorm.com', '123456', 'Admin');

    // Insert mock data in correct order
    db.exec(`
        -- Insert Students (IDs 2-11)
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

        -- Insert Security Staff (IDs 12-14)
        INSERT INTO users (name, email, password, phoneNumber, role) VALUES
        ('Robert Brown', 'robert.b@security.edu', '123456', '+1234567800', 'Security'),
        ('Amanda White', 'amanda.w@security.edu', '123456', '+1234567801', 'Security'),
        ('Carlos Rodriguez', 'carlos.r@security.edu', '123456', '+1234567802', 'Security');

        -- Insert Chefs (IDs 15-17)
        INSERT INTO users (name, email, password, phoneNumber, role) VALUES
        ('Chef Gordon', 'gordon@kitchen.edu', '123456', '+1234567700', 'Chef'),
        ('Chef Julia', 'julia@kitchen.edu', '123456', '+1234567701', 'Chef'),
        ('Chef Marco', 'marco@kitchen.edu', '123456', '+1234567702', 'Chef');
    `);

    // Insert related data with proper IDs
    db.exec(`
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
        (2, 12, datetime('now', '-1 day', '+8 hours'), datetime('now', '-1 day', '+10 hours')),
        (3, 12, datetime('now', '-1 day', '+9 hours'), datetime('now', '-1 day', '+14 hours')),
        (4, 13, datetime('now', '-1 day', '+10 hours'), datetime('now', '-1 day', '+16 hours')),
        (5, 13, datetime('now', '-1 day', '+11 hours'), datetime('now', '-1 day', '+18 hours')),
        (6, 14, datetime('now', '-6 hours'), datetime('now', '-4 hours')),
        (7, 12, datetime('now', '-5 hours'), datetime('now', '-3 hours')),
        (8, 13, datetime('now', '-4 hours'), datetime('now', '-2 hours')),
        (9, 14, datetime('now', '-3 hours'), NULL),
        (10, 12, datetime('now', '-2 hours'), NULL);

        -- Insert Meal Checkins (past 24 hours)
        INSERT INTO meal_checkins (studentId, chefId, checkInTime) VALUES
        (2, 15, datetime('now', '-1 day', '+18 hours')),
        (3, 15, datetime('now', '-1 day', '+18 hours', '+5 minutes')),
        (4, 15, datetime('now', '-1 day', '+18 hours', '+10 minutes')),
        (5, 15, datetime('now', '-1 day', '+18 hours', '+15 minutes')),
        (6, 15, datetime('now', '-1 day', '+18 hours', '+20 minutes')),
        (7, 16, datetime('now', '-8 hours')),
        (8, 16, datetime('now', '-8 hours', '+5 minutes')),
        (9, 16, datetime('now', '-8 hours', '+10 minutes')),
        (10, 16, datetime('now', '-8 hours', '+15 minutes')),
        (2, 17, datetime('now', '-2 hours')),
        (3, 17, datetime('now', '-2 hours', '+5 minutes')),
        (4, 17, datetime('now', '-2 hours', '+10 minutes')),
        (5, 17, datetime('now', '-2 hours', '+15 minutes'));
    `);
}

// User related queries
export const createUser = db.prepare(`
    INSERT INTO users (name, email, password, phoneNumber, role)
    VALUES (?, ?, ?, ?, ?)
`);

export const getUserByEmail = db.prepare(`
    SELECT * FROM users WHERE email = ?
`);

export const updateUserPassword = db.prepare(`
    UPDATE users SET password = ? WHERE id = ?
`);

export const updateUserPasswordByEmail = db.prepare(`
    UPDATE users SET password = ? WHERE email = ?
`);

export const getAllUsers = db.prepare(`
    SELECT * FROM users
`);

// Admin related queries
export const getAllStudents = db.prepare(`
    SELECT * FROM users WHERE role = 'Student'
`);

export const getAllComplaints = db.prepare(`
    SELECT c.*, u.name as userName, u.email as userEmail 
    FROM complaints c 
    JOIN users u ON c.userId = u.id 
    ORDER BY submittedTime DESC
`);

export const getTravelRequests = db.prepare(`
    SELECT t.*, u.name as studentName, u.email as studentEmail 
    FROM travel_tickets t 
    JOIN users u ON t.studentId = u.id 
    ORDER BY requestTime DESC
`);

export const updateTravelRequest = db.prepare(`
    UPDATE travel_tickets 
    SET status = ?, adminId = ? 
    WHERE id = ?
`);

export const getEntryExitLogs = db.prepare(`
    SELECT l.*, 
           s.name as studentName, 
           s.email as studentEmail,
           sec.name as securityName
    FROM entry_exit_logs l 
    JOIN users s ON l.studentId = s.id 
    JOIN users sec ON l.securityId = sec.id 
    ORDER BY entryTime DESC
`);

export const getMealCheckins = db.prepare(`
    SELECT m.*, 
           s.name as studentName, 
           s.email as studentEmail,
           c.name as chefName
    FROM meal_checkins m 
    JOIN users s ON m.studentId = s.id 
    JOIN users c ON m.chefId = c.id 
    ORDER BY checkInTime DESC
`);

// Stats queries
export const getStudentCount = db.prepare(`
    SELECT COUNT(*) as count FROM users WHERE role = 'Student'
`);

export const getPendingTravelRequests = db.prepare(`
    SELECT COUNT(*) as count FROM travel_tickets WHERE status = 'Pending'
`);

export const getTodaysMealCheckins = db.prepare(`
    SELECT COUNT(*) as count 
    FROM meal_checkins 
    WHERE date(checkInTime) = date('now')
`);

export const getCurrentlyOutStudents = db.prepare(`
    SELECT COUNT(*) as count 
    FROM entry_exit_logs 
    WHERE exitTime IS NOT NULL AND entryTime IS NULL
`);

// Export the database instance for other queries
export default db; 