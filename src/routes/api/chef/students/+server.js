import { json } from '@sveltejs/kit';
import { getAllStudents } from '$lib/db/database.js';

export async function GET() {
    try {
        const students = getAllStudents.all();
        return json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        return json({ message: 'Error fetching students' }, { status: 500 });
    }
} 