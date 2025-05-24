<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    
    let user = null;
    
    onMount(() => {
        checkAuth();
    });

    function checkAuth() {
        // Check if user data exists in session storage
        const userData = sessionStorage.getItem('user');
        if (userData) {
            user = JSON.parse(userData);
        } else if (!$page.url.pathname.startsWith('/login')) {
            // If no user data and not on login page, redirect to login
            goto('/login');
        }
    }

    async function logout() {
        sessionStorage.removeItem('user');
        user = null;
        await goto('/login');
    }

    // Watch for page changes to check auth
    $: if ($page) {
        checkAuth();
    }

    // Redirect logged-in users away from login page
    $: if (user && $page.url.pathname === '/login') {
        goto(`/${user.role.toLowerCase()}`);
    }
</script>

{#if user && !$page.url.pathname.startsWith('/login')}
    <nav>
        <div class="nav-brand">Dorm Management System</div>
        <div class="nav-links">
            {#if user.role === 'Admin'}
                <a href="/admin" class:active={$page.url.pathname === '/admin'}>Dashboard</a>
            {:else if user.role === 'Student'}
                <a href="/student" class:active={$page.url.pathname === '/student'}>Dashboard</a>
            {:else if user.role === 'Security'}
                <a href="/security" class:active={$page.url.pathname === '/security'}>Dashboard</a>
            {:else if user.role === 'Chef'}
                <a href="/chef" class:active={$page.url.pathname === '/chef'}>Dashboard</a>
            {/if}
            <button on:click={logout}>Logout</button>
        </div>
    </nav>
{/if}

<main class:auth-page={$page.url.pathname === '/login'}>
    <slot />
</main>

<style>
    nav {
        background-color: #333;
        color: white;
        padding: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: sticky;
        top: 0;
        z-index: 100;
    }

    .nav-brand {
        font-size: 1.2rem;
        font-weight: bold;
    }

    .nav-links {
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    .nav-links a {
        color: white;
        text-decoration: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
    }

    .nav-links a:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .nav-links a.active {
        background-color: rgba(255, 255, 255, 0.2);
    }

    button {
        background-color: #dc3545;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
    }

    button:hover {
        background-color: #c82333;
    }

    main {
        min-height: calc(100vh - 64px);
        background-color: #f5f5f5;
    }

    main.auth-page {
        min-height: 100vh;
    }
</style> 