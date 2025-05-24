import { json } from '@sveltejs/kit';
import db from '$lib/db/database.js';

// Prepare statements
const getUserMealCheckins = db.prepare(`
    SELECT m.*, u.name as chefName
    FROM meal_checkins m
    JOIN users u ON m.chefId = u.id
    WHERE m.studentId = ?
    ORDER BY m.checkInTime DESC
`);

export async function GET({ request }) {
    try {
        // Get user data from session storage (sent in headers)
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return json({ message: 'Unauthorized' }, { status: 401 });
        }

        const userData = JSON.parse(atob(authHeader.split(' ')[1]));
        if (!userData || !userData.id || userData.role !== 'Student') {
            return json({ message: 'Unauthorized' }, { status: 401 });
        }

        const checkins = getUserMealCheckins.all(userData.id);
        return json(checkins);
    } catch (error) {
        console.error('Error fetching meal checkins:', error);
        return json({ message: 'Error fetching meal checkins' }, { status: 500 });
    }
} 