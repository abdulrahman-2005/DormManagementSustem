import { json } from '@sveltejs/kit';
import db from '$lib/db/database.js';

export async function POST({ request }) {
    try {
        const { studentId, chefId } = await request.json();

        // Check if student has already checked in today
        const checkExisting = db.prepare(`
            SELECT 1 
            FROM meal_checkins 
            WHERE studentId = ? 
            AND date(checkInTime) = date('now')
        `);

        const exists = checkExisting.get(studentId);
        if (exists) {
            return json({ message: 'Student has already checked in today' }, { status: 400 });
        }

        // Create prepared statement for inserting checkin
        const createCheckin = db.prepare(`
            INSERT INTO meal_checkins (studentId, chefId, checkInTime)
            VALUES (?, ?, datetime('now'))
        `);

        createCheckin.run(studentId, chefId);

        return json({ message: 'Check-in successful' });
    } catch (error) {
        console.error('Error checking in student:', error);
        return json({ message: 'Error checking in student' }, { status: 500 });
    }
} 