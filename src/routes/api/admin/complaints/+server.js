import { json } from '@sveltejs/kit';
import { getAllComplaints } from '$lib/db/database.js';

export async function GET() {
    try {
        const complaints = getAllComplaints.all();
        return json(complaints);
    } catch (error) {
        console.error('Error fetching complaints:', error);
        return json({ message: 'Error fetching complaints' }, { status: 500 });
    }
} 