import { json } from '@sveltejs/kit';
import db from '$lib/db/database.js';

// Prepare statements
const getUserTravelRequests = db.prepare(`
    SELECT * FROM travel_tickets 
    WHERE studentId = ? 
    ORDER BY requestTime DESC
`);

const submitTravelRequest = db.prepare(`
    INSERT INTO travel_tickets (studentId, requestTime, startTime, endTime, status)
    VALUES (?, datetime('now'), ?, ?, 'Pending')
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

        const requests = getUserTravelRequests.all(userData.id);
        return json(requests);
    } catch (error) {
        console.error('Error fetching travel requests:', error);
        return json({ message: 'Error fetching travel requests' }, { status: 500 });
    }
}

export async function POST({ request }) {
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

        const { startTime, endTime } = await request.json();
        
        // Validate required fields
        if (!startTime || !endTime) {
            return json({ message: 'Start time and end time are required' }, { status: 400 });
        }

        // Convert to Date objects for validation
        const start = new Date(startTime);
        const end = new Date(endTime);
        const now = new Date();

        // Validate dates
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return json({ message: 'Invalid date format' }, { status: 400 });
        }

        // Start time must be in the future
        if (start < now) {
            return json({ message: 'Start time must be in the future' }, { status: 400 });
        }

        // End time must be after start time
        if (end <= start) {
            return json({ message: 'End time must be after start time' }, { status: 400 });
        }

        // Maximum travel duration is 7 days
        const maxDuration = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
        if (end - start > maxDuration) {
            return json({ message: 'Travel duration cannot exceed 7 days' }, { status: 400 });
        }

        submitTravelRequest.run(userData.id, startTime, endTime);
        return json({ message: 'Travel request submitted successfully' });
    } catch (error) {
        console.error('Error submitting travel request:', error);
        return json({ message: 'Error submitting travel request' }, { status: 500 });
    }
} 