import { json } from '@sveltejs/kit';
import db from '$lib/db/database.js';

// Prepare statements
const getUserComplaints = db.prepare(`
    SELECT * FROM complaints 
    WHERE userId = ? 
    ORDER BY submittedTime DESC
`);

const submitComplaint = db.prepare(`
    INSERT INTO complaints (userId, description, submittedTime)
    VALUES (?, ?, datetime('now'))
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

        const complaints = getUserComplaints.all(userData.id);
        return json(complaints);
    } catch (error) {
        console.error('Error fetching complaints:', error);
        return json({ message: 'Error fetching complaints' }, { status: 500 });
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

        const { description } = await request.json();
        if (!description || description.trim().length === 0) {
            return json({ message: 'Description is required' }, { status: 400 });
        }

        if (description.length > 1000) {
            return json({ message: 'Description is too long (max 1000 characters)' }, { status: 400 });
        }

        submitComplaint.run(userData.id, description.trim());
        return json({ message: 'Complaint submitted successfully' });
    } catch (error) {
        console.error('Error submitting complaint:', error);
        return json({ message: 'Error submitting complaint' }, { status: 500 });
    }
} 