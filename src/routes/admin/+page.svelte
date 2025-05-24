<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    let activeTab = 'dashboard';
    let user = null;
    
    // Add refresh interval ID
    let refreshInterval;
    
    let stats = {
        studentCount: 0,
        pendingRequests: 0,
        todaysMeals: 0,
        outStudents: 0
    };

    let users = [];
    let complaints = [];
    let travelRequests = [];

    // Form data for creating new user
    let newUser = {
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        role: 'Student'
    };

    let message = '';
    let error = '';

    onMount(async () => {
        const userDataStr = sessionStorage.getItem('user');
        if (!userDataStr) {
            goto('/');
            return;
        }
        user = JSON.parse(userDataStr);
        await loadData();

        // Set up periodic refresh every 30 seconds
        refreshInterval = setInterval(loadData, 30000);

        // Add page visibility handler
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            // Cleanup on component destroy
            if (refreshInterval) clearInterval(refreshInterval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    });

    // Handle page visibility changes
    function handleVisibilityChange() {
        if (document.visibilityState === 'visible') {
            loadData();
        }
    }

    async function loadData() {
        await Promise.all([
            loadStats(),
            loadUsers(),
            loadComplaints(),
            loadTravelRequests()
        ]);
    }

    async function loadStats() {
        try {
            const response = await fetch('/api/admin/stats');
            if (response.ok) {
                stats = await response.json();
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async function loadUsers() {
        try {
            const response = await fetch('/api/admin/users');
            if (response.ok) {
                users = await response.json();
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    async function loadComplaints() {
        try {
            const response = await fetch('/api/admin/complaints');
            if (response.ok) {
                complaints = await response.json();
            }
        } catch (error) {
            console.error('Error loading complaints:', error);
        }
    }

    async function loadTravelRequests() {
        try {
            const response = await fetch('/api/admin/travel-requests');
            if (response.ok) {
                travelRequests = await response.json();
            }
        } catch (error) {
            console.error('Error loading travel requests:', error);
        }
    }

    async function createUser(event) {
        event.preventDefault();
        error = '';
        message = '';

        try {
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newUser)
            });

            const data = await response.json();
            if (response.ok) {
                message = 'User created successfully';
                newUser = {
                    name: '',
                    email: '',
                    password: '',
                    phoneNumber: '',
                    role: 'Student'
                };
                await loadUsers();
            } else {
                error = data.message || 'Error creating user';
            }
        } catch (e) {
            error = 'Error creating user';
        }
    }

    async function updateTravelRequest(id, status) {
        try {
            const response = await fetch(`/api/admin/travel-requests/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                await loadTravelRequests();
            }
        } catch (error) {
            console.error('Error updating travel request:', error);
        }
    }
</script>

<div class="container">
    <div class="nav-tabs">
        <button class="btn {activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}" 
                on:click={() => activeTab = 'dashboard'}>
            Dashboard
        </button>
        <button class="btn {activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}" 
                on:click={() => activeTab = 'users'}>
            Users
        </button>
        <button class="btn {activeTab === 'travel' ? 'btn-primary' : 'btn-secondary'}" 
                on:click={() => activeTab = 'travel'}>
            Travel Requests
        </button>
        <button class="btn {activeTab === 'complaints' ? 'btn-primary' : 'btn-secondary'}" 
                on:click={() => activeTab = 'complaints'}>
            Complaints
        </button>
    </div>

    <div class="content">
        {#if activeTab === 'dashboard'}
            <div class="dashboard">
                <h1>Admin Dashboard</h1>
                <div class="grid grid-cols-4">
                    <div class="card">
                        <h3>Students</h3>
                        <p class="stat">{stats.studentCount}</p>
                        <p class="stat-label">Total Students</p>
                    </div>
                    <div class="card">
                        <h3>Pending Requests</h3>
                        <p class="stat">{stats.pendingRequests}</p>
                        <p class="stat-label">Travel Requests</p>
                    </div>
                    <div class="card">
                        <h3>Today's Meals</h3>
                        <p class="stat">{stats.todaysMeals}</p>
                        <p class="stat-label">Check-ins</p>
                    </div>
                    <div class="card">
                        <h3>Out Students</h3>
                        <p class="stat">{stats.outStudents}</p>
                        <p class="stat-label">Currently Out</p>
                    </div>
                </div>
            </div>
        {/if}

        {#if activeTab === 'users'}
            <div class="users-section">
                <h2>Create New User</h2>
                <div class="card">
                    <form on:submit={createUser}>
                        {#if message}
                            <div class="alert alert-success">{message}</div>
                        {/if}
                        {#if error}
                            <div class="alert alert-error">{error}</div>
                        {/if}

                        <div class="grid grid-cols-2" style="gap: var(--space-lg)">
                            <div class="form-group">
                                <label class="form-label" for="name">Name</label>
                                <input 
                                    class="form-input"
                                    type="text" 
                                    id="name" 
                                    bind:value={newUser.name} 
                                    required
                                />
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="email">Email</label>
                                <input 
                                    class="form-input"
                                    type="email" 
                                    id="email" 
                                    bind:value={newUser.email} 
                                    required
                                />
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="password">Password</label>
                                <input 
                                    class="form-input"
                                    type="password" 
                                    id="password" 
                                    bind:value={newUser.password} 
                                    required
                                />
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="phoneNumber">Phone Number</label>
                                <input 
                                    class="form-input"
                                    type="tel" 
                                    id="phoneNumber" 
                                    bind:value={newUser.phoneNumber}
                                />
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="role">Role</label>
                                <select 
                                    class="form-input"
                                    id="role" 
                                    bind:value={newUser.role} 
                                    required
                                >
                                    <option value="Student">Student</option>
                                    <option value="Security">Security</option>
                                    <option value="Chef">Chef</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                        </div>

                        <button type="submit" class="btn btn-primary">Create User</button>
                    </form>
                </div>

                <h3>All Users</h3>
                <div class="table-container">
                    {#if users.length === 0}
                        <p class="empty-state">No users found.</p>
                    {:else}
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Phone</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each users as user}
                                    <tr>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span class="badge badge-{user.role.toLowerCase()}">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>{user.phoneNumber || '-'}</td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    {/if}
                </div>
            </div>
        {/if}

        {#if activeTab === 'travel'}
            <div class="travel-section">
                <h2>Travel Requests</h2>
                <div class="table-container">
                    {#if travelRequests.length === 0}
                        <p class="empty-state">No travel requests found.</p>
                    {:else}
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Start Time</th>
                                    <th>End Time</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each travelRequests as request}
                                    <tr>
                                        <td>{request.studentName}</td>
                                        <td>{new Date(request.startTime).toLocaleString()}</td>
                                        <td>{new Date(request.endTime).toLocaleString()}</td>
                                        <td>
                                            <span class="badge badge-{request.status.toLowerCase()}">
                                                {request.status}
                                            </span>
                                        </td>
                                        <td>
                                            {#if request.status === 'Pending'}
                                                <div class="button-group">
                                                    <button 
                                                        class="btn btn-primary btn-sm"
                                                        on:click={() => updateTravelRequest(request.id, 'Approved')}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button 
                                                        class="btn btn-danger btn-sm"
                                                        on:click={() => updateTravelRequest(request.id, 'Rejected')}
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            {/if}
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    {/if}
                </div>
            </div>
        {/if}

        {#if activeTab === 'complaints'}
            <div class="complaints-section">
                <h2>Complaints</h2>
                <div class="table-container">
                    {#if complaints.length === 0}
                        <p class="empty-state">No complaints found.</p>
                    {:else}
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Description</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each complaints as complaint}
                                    <tr>
                                        <td>{complaint.userName}</td>
                                        <td>{complaint.description}</td>
                                        <td>{new Date(complaint.submittedTime).toLocaleString()}</td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    {/if}
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
    .nav-tabs {
        display: flex;
        gap: var(--space-md);
        margin-bottom: var(--space-xl);
    }

    .content {
        margin-top: var(--space-xl);
    }

    .stat {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--primary);
        margin: var(--space-md) 0;
    }

    .stat-label {
        color: var(--text-secondary);
        font-size: 0.875rem;
    }

    .empty-state {
        text-align: center;
        padding: var(--space-xl);
        color: var(--text-secondary);
    }

    .alert {
        padding: var(--space-md);
        border-radius: var(--radius-md);
        margin-bottom: var(--space-lg);
    }

    .alert-success {
        background-color: var(--success);
        color: white;
    }

    .alert-error {
        background-color: var(--danger);
        color: white;
    }

    .button-group {
        display: flex;
        gap: var(--space-sm);
    }

    .btn-sm {
        padding: var(--space-xs) var(--space-sm);
        font-size: 0.875rem;
    }

    h1, h2, h3 {
        margin-bottom: var(--space-lg);
    }

    .dashboard h1 {
        margin-bottom: var(--space-2xl);
    }

    /* Role-specific badge colors */
    .badge-student {
        background-color: #dbeafe;
        color: #1e40af;
    }

    .badge-admin {
        background-color: #fce7f3;
        color: #9d174d;
    }

    .badge-security {
        background-color: #e0e7ff;
        color: #3730a3;
    }

    .badge-chef {
        background-color: #ecfdf5;
        color: #065f46;
    }
</style> 