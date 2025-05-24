<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    
    let activeTab = 'dashboard';
    let user = null;
    
    // Add refresh interval ID
    let refreshInterval;
    
    // Form data
    let newComplaint = {
        description: ''
    };
    
    let newTravelRequest = {
        startTime: '',
        endTime: ''
    };
    
    let complaints = [];
    let travelRequests = [];
    let mealCheckins = [];
    
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
            loadComplaints(),
            loadTravelRequests(),
            loadMealCheckins()
        ]);
    }

    async function loadComplaints() {
        try {
            const response = await fetch('/api/student/complaints', {
                headers: {
                    'Authorization': `Bearer ${btoa(JSON.stringify(user))}`
                }
            });
            if (response.ok) {
                complaints = await response.json();
            } else {
                throw new Error('Failed to load complaints');
            }
        } catch (error) {
            console.error('Error loading complaints:', error);
        }
    }

    async function loadTravelRequests() {
        try {
            const response = await fetch('/api/student/travel-requests', {
                headers: {
                    'Authorization': `Bearer ${btoa(JSON.stringify(user))}`
                }
            });
            if (response.ok) {
                travelRequests = await response.json();
            } else {
                throw new Error('Failed to load travel requests');
            }
        } catch (error) {
            console.error('Error loading travel requests:', error);
        }
    }

    async function loadMealCheckins() {
        try {
            const response = await fetch('/api/student/meal-checkins', {
                headers: {
                    'Authorization': `Bearer ${btoa(JSON.stringify(user))}`
                }
            });
            if (response.ok) {
                mealCheckins = await response.json();
            } else {
                throw new Error('Failed to load meal checkins');
            }
        } catch (error) {
            console.error('Error loading meal checkins:', error);
        }
    }

    async function submitComplaint(event) {
        event.preventDefault();
        error = '';
        message = '';

        try {
            const response = await fetch('/api/student/complaints', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${btoa(JSON.stringify(user))}`
                },
                body: JSON.stringify(newComplaint)
            });

            if (response.ok) {
                message = 'Complaint submitted successfully';
                newComplaint.description = '';
                await loadComplaints();
            } else {
                const data = await response.json();
                error = data.message || 'Error submitting complaint';
            }
        } catch (e) {
            error = 'Error submitting complaint';
        }
    }

    async function submitTravelRequest(event) {
        event.preventDefault();
        error = '';
        message = '';

        try {
            const response = await fetch('/api/student/travel-requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${btoa(JSON.stringify(user))}`
                },
                body: JSON.stringify(newTravelRequest)
            });

            if (response.ok) {
                message = 'Travel request submitted successfully';
                newTravelRequest = {
                    startTime: '',
                    endTime: ''
                };
                await loadTravelRequests();
            } else {
                const data = await response.json();
                error = data.message || 'Error submitting travel request';
            }
        } catch (e) {
            error = 'Error submitting travel request';
        }
    }
</script>

<div class="container">
    <div class="nav-tabs">
        <button class="btn {activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}" 
                on:click={() => activeTab = 'dashboard'}>
            Dashboard
        </button>
        <button class="btn {activeTab === 'complaints' ? 'btn-primary' : 'btn-secondary'}" 
                on:click={() => activeTab = 'complaints'}>
            Submit Complaint
        </button>
        <button class="btn {activeTab === 'travel' ? 'btn-primary' : 'btn-secondary'}" 
                on:click={() => activeTab = 'travel'}>
            Travel Request
        </button>
        <button class="btn {activeTab === 'meals' ? 'btn-primary' : 'btn-secondary'}" 
                on:click={() => activeTab = 'meals'}>
            Meal Status
        </button>
    </div>

    <div class="content">
        {#if activeTab === 'dashboard'}
            <div class="dashboard">
                <h1>Welcome, {user?.name}</h1>
                <div class="grid grid-cols-3">
                    <div class="card">
                        <h3>Travel Requests</h3>
                        <p class="stat">{travelRequests.length}</p>
                        <p class="stat-label">Total Requests</p>
                    </div>
                    <div class="card">
                        <h3>Complaints</h3>
                        <p class="stat">{complaints.length}</p>
                        <p class="stat-label">Total Complaints</p>
                    </div>
                    <div class="card">
                        <h3>Today's Meals</h3>
                        <p class="stat">{mealCheckins.length}</p>
                        <p class="stat-label">Check-ins</p>
                    </div>
                </div>
            </div>
        {/if}

        {#if activeTab === 'complaints'}
            <div class="complaints-section">
                <h2>Submit a Complaint</h2>
                <div class="card">
                    <form on:submit={submitComplaint}>
                        {#if message}
                            <div class="alert alert-success">{message}</div>
                        {/if}
                        {#if error}
                            <div class="alert alert-error">{error}</div>
                        {/if}

                        <div class="form-group">
                            <label class="form-label" for="description">Description</label>
                            <textarea 
                                class="form-input"
                                id="description" 
                                bind:value={newComplaint.description} 
                                required
                                rows="4"
                                placeholder="Describe your complaint..."
                            ></textarea>
                        </div>

                        <button type="submit" class="btn btn-primary">Submit Complaint</button>
                    </form>
                </div>

                <h3>Previous Complaints</h3>
                <div class="table-container">
                    {#if complaints.length === 0}
                        <p class="empty-state">No complaints submitted yet.</p>
                    {:else}
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Ticket ID</th>
                                    <th>Date</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each complaints as complaint}
                                    <tr>
                                        <td>
                                            <span class="badge badge-info">#{complaint.id}</span>
                                        </td>
                                        <td>{new Date(complaint.submittedTime).toLocaleString()}</td>
                                        <td>{complaint.description}</td>
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
                <h2>Submit Travel Request</h2>
                <div class="card">
                    <form on:submit={submitTravelRequest}>
                        {#if message}
                            <div class="alert alert-success">{message}</div>
                        {/if}
                        {#if error}
                            <div class="alert alert-error">{error}</div>
                        {/if}

                        <div class="form-group">
                            <label class="form-label" for="startTime">Start Time</label>
                            <input 
                                class="form-input"
                                type="datetime-local" 
                                id="startTime" 
                                bind:value={newTravelRequest.startTime} 
                                required
                            />
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="endTime">End Time</label>
                            <input 
                                class="form-input"
                                type="datetime-local" 
                                id="endTime" 
                                bind:value={newTravelRequest.endTime} 
                                required
                            />
                        </div>

                        <button type="submit" class="btn btn-primary">Submit Request</button>
                    </form>
                </div>

                <h3>Travel Requests</h3>
                <div class="table-container">
                    {#if travelRequests.length === 0}
                        <p class="empty-state">No travel requests submitted yet.</p>
                    {:else}
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Request ID</th>
                                    <th>Start Time</th>
                                    <th>End Time</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each travelRequests as request}
                                    <tr>
                                        <td>
                                            <span class="badge badge-info">#{request.id}</span>
                                        </td>
                                        <td>{new Date(request.startTime).toLocaleString()}</td>
                                        <td>{new Date(request.endTime).toLocaleString()}</td>
                                        <td>
                                            <span class="badge badge-{request.status.toLowerCase()}">
                                                {request.status}
                                            </span>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    {/if}
                </div>
            </div>
        {/if}

        {#if activeTab === 'meals'}
            <div class="meals-section">
                <h2>Meal Check-ins</h2>
                <div class="table-container">
                    {#if mealCheckins.length === 0}
                        <p class="empty-state">No meal check-ins recorded yet.</p>
                    {:else}
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Checked by</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each mealCheckins as checkin}
                                    <tr>
                                        <td>{new Date(checkin.checkInTime).toLocaleDateString()}</td>
                                        <td>{new Date(checkin.checkInTime).toLocaleTimeString()}</td>
                                        <td>{checkin.chefName}</td>
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

    h1, h2, h3 {
        margin-bottom: var(--space-lg);
    }

    .dashboard h1 {
        margin-bottom: var(--space-2xl);
    }

    .badge-info {
        background-color: var(--info);
        color: white;
        font-family: var(--font-mono);
    }
</style> 