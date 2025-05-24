import { json } from '@sveltejs/kit';
import { getUserByEmail } from '$lib/db/database.js';

export async function POST({ request }) {
    try {
        const { email, password } = await request.json();

        const user = getUserByEmail.get(email);

        if (!user || user.password !== password) {
            return json({ 
                message: 'Invalid email or password' 
            }, { status: 401 });
        }

        // Return user data without password
        return json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            redirectTo: `/${user.role.toLowerCase()}`
        });
    } catch (error) {
        console.error('Login error:', error);
        return json({ 
            message: 'Error during login' 
        }, { status: 500 });
    }
} 