import { json } from '@sveltejs/kit';
import db from '$lib/db/database.js';

export async function POST({ request }) {
    try {
        const { studentId, securityId } = await request.json();

        // Create prepared statement for inserting entry log
        const createEntryLog = db.prepare(`
            INSERT INTO entry_exit_logs (studentId, securityId, entryTime)
            VALUES (?, ?, datetime('now'))
        `);

        createEntryLog.run(studentId, securityId);

        return json({ message: 'Entry logged successfully' });
    } catch (error) {
        console.error('Error logging entry:', error);
        return json({ message: 'Error logging entry' }, { status: 500 });
    }
} 