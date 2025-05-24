import { json } from '@sveltejs/kit';
import db from '$lib/db/database.js';

export async function POST({ request }) {
    try {
        const { query } = await request.json();

        // Execute the query
        const stmt = db.prepare(query);
        
        const isSelect = query.trim().toUpperCase().startsWith('SELECT');
        const results = isSelect ? stmt.all() : stmt.run();

        return json({ 
            results,
            message: !isSelect ? 'Query executed successfully' : undefined
        });
    } catch (error) {
        console.error('Database query error:', error);
        return json({
            message: 'Error executing query: ' + error.message
        }, { status: 500 });
    }
} 