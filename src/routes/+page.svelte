<script>
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    onMount(() => {
        goto('/login');
    });
</script>

<div class="container">
    <h1>Dorm Management System</h1>
    <p>Redirecting to login page...</p>
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        text-align: center;
    }

    h1 {
        color: #333;
        margin-bottom: 1rem;
    }

    p {
        color: #666;
    }
</style>
