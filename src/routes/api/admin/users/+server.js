import { json } from '@sveltejs/kit';
import { createUser, getAllUsers } from '$lib/db/database.js';

export async function GET() {
    try {
        const users = getAllUsers.all();
        return json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return json({ message: 'Error fetching users' }, { status: 500 });
    }
}

export async function POST({ request }) {
    try {
        const userData = await request.json();
        
        // Basic validation
        if (!userData.name || !userData.email || !userData.password || !userData.role) {
            return json({ 
                message: 'Missing required fields' 
            }, { status: 400 });
        }

        // Create user in database
        createUser.run(
            userData.name,
            userData.email,
            userData.password,
            userData.phoneNumber || null,
            userData.role
        );

        return json({ 
            message: 'User created successfully' 
        });
    } catch (error) {
        console.error('Error creating user:', error);
        
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return json({ 
                message: 'Email already exists' 
            }, { status: 400 });
        }

        return json({ 
            message: 'Error creating user' 
        }, { status: 500 });
    }
} 