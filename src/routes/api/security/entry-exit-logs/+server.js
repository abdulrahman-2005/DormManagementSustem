import { json } from '@sveltejs/kit';
import { getEntryExitLogs } from '$lib/db/database.js';

export async function GET() {
    try {
        const logs = getEntryExitLogs.all();
        return json(logs);
    } catch (error) {
        console.error('Error fetching entry/exit logs:', error);
        return json({ message: 'Error fetching entry/exit logs' }, { status: 500 });
    }
} 