import { json } from '@sveltejs/kit';
import db from '$lib/db/database.js';

export async function GET() {
    try {
        const getTodayCheckins = db.prepare(`
            SELECT m.*, 
                   s.name as studentName, 
                   s.email as studentEmail,
                   c.name as chefName
            FROM meal_checkins m 
            JOIN users s ON m.studentId = s.id 
            JOIN users c ON m.chefId = c.id 
            WHERE date(checkInTime) = date('now')
            ORDER BY checkInTime DESC
        `);

        const checkins = getTodayCheckins.all();
        return json(checkins);
    } catch (error) {
        console.error('Error fetching today\'s checkins:', error);
        return json({ message: 'Error fetching today\'s checkins' }, { status: 500 });
    }
} 