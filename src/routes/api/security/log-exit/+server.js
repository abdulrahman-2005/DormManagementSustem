import { json } from '@sveltejs/kit';
import db from '$lib/db/database.js';

export async function POST({ request }) {
    try {
        const { studentId, securityId } = await request.json();

        // Update the most recent entry log for this student that doesn't have an exit time
        const updateExitLog = db.prepare(`
            UPDATE entry_exit_logs 
            SET exitTime = datetime('now')
            WHERE studentId = ? 
            AND exitTime IS NULL
            AND id = (
                SELECT id FROM entry_exit_logs 
                WHERE studentId = ? 
                AND exitTime IS NULL 
                ORDER BY entryTime DESC 
                LIMIT 1
            )
        `);

        const result = updateExitLog.run(studentId, studentId);

        if (result.changes === 0) {
            return json({ message: 'No active entry found for student' }, { status: 400 });
        }

        return json({ message: 'Exit logged successfully' });
    } catch (error) {
        console.error('Error logging exit:', error);
        return json({ message: 'Error logging exit' }, { status: 500 });
    }
} 