<script>
    import { goto } from '$app/navigation';

    let email = '';
    let password = '';
    let error = '';
    let loading = false;

    async function handleSubmit(event) {
        event.preventDefault();
        loading = true;
        error = '';

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (response.ok) {
                // Store user data in session storage
                sessionStorage.setItem('user', JSON.stringify(data.user));
                // Redirect to appropriate dashboard
                goto(data.redirectTo);
            } else {
                error = data.message || 'Login failed';
            }
        } catch (e) {
            error = 'An error occurred during login';
            console.error('Login error:', e);
        } finally {
            loading = false;
        }
    }
</script>

<div class="login-container">
    <h1>Dorm Management System</h1>
    <div class="login-box" action="/login">
        <h2>Login</h2>
        
        <form on:submit={handleSubmit}>
            {#if error}
                <div class="error">{error}</div>
            {/if}
            
            <div class="form-group">
                <label for="email">Email:</label>
                <input 
                    type="email" 
                    id="email" 
                    bind:value={email} 
                    required
                    disabled={loading}
                />
            </div>
            
            <div class="form-group">
                <label for="password">Password:</label>
                <input 
                    type="password" 
                    id="password" 
                    bind:value={password} 
                    required
                    disabled={loading}
                />
            </div>
            
            <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>
        </form>
    </div>
</div>

<style>
    .login-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 20px;
        background-color: #f5f5f5;
    }

    .login-box {
        background: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        width: 100%;
        max-width: 400px;
    }

    h1 {
        color: #333;
        margin-bottom: 2rem;
        text-align: center;
    }

    h2 {
        color: #333;
        margin-bottom: 1.5rem;
        text-align: center;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    label {
        display: block;
        margin-bottom: 0.5rem;
        color: #666;
    }

    input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
    }

    input:focus {
        outline: none;
        border-color: #4CAF50;
        box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
    }

    button {
        width: 100%;
        padding: 0.75rem;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
        margin-top: 1rem;
    }

    button:hover:not(:disabled) {
        background-color: #45a049;
    }

    button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
    }

    .error {
        color: #dc3545;
        background-color: #ffebee;
        padding: 0.75rem;
        border-radius: 4px;
        margin-bottom: 1rem;
        text-align: center;
    }
</style> 