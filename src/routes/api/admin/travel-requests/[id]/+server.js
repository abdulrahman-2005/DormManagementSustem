import { json } from '@sveltejs/kit';
import { updateTravelRequest } from '$lib/db/database.js';

export async function PUT({ params, request }) {
    try {
        const { id } = params;
        const { status } = await request.json();
        const adminId = 1; // Using default admin ID for simplicity

        updateTravelRequest.run(status, adminId, id);
        return json({ message: 'Travel request updated successfully' });
    } catch (error) {
        console.error('Error updating travel request:', error);
        return json({ message: 'Error updating travel request' }, { status: 500 });
    }
} 