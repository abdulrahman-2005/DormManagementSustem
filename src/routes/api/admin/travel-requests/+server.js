import { json } from '@sveltejs/kit';
import { getTravelRequests } from '$lib/db/database.js';

export async function GET() {
    try {
        const requests = getTravelRequests.all();
        return json(requests);
    } catch (error) {
        console.error('Error fetching travel requests:', error);
        return json({ message: 'Error fetching travel requests' }, { status: 500 });
    }
} 