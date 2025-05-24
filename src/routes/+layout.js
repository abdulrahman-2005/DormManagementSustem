export const ssr = false; // Disable server-side rendering since we're using client-side auth

export async function load({ url }) {
    // Public routes that don't require authentication
    const publicRoutes = ['/', '/login'];
    
    // Check if we're on a public route
    if (publicRoutes.includes(url.pathname)) {
        return {};
    }

    // For protected routes, we'll handle the auth check in the browser
    return {};
} 