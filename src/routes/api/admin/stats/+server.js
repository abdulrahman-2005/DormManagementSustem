import { json } from '@sveltejs/kit';
import { 
    getStudentCount, 
    getPendingTravelRequests, 
    getTodaysMealCheckins,
    getCurrentlyOutStudents 
} from '$lib/db/database.js';

export async function GET() {
    try {
        const stats = {
            studentCount: getStudentCount.get().count,
            pendingRequests: getPendingTravelRequests.get().count,
            todaysMeals: getTodaysMealCheckins.get().count,
            outStudents: getCurrentlyOutStudents.get().count
        };

        return json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        return json({ message: 'Error fetching stats' }, { status: 500 });
    }
} 