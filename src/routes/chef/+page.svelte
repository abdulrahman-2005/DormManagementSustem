<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    
    let user = null;
    let students = [];
    let todayCheckins = [];
    let refreshInterval;
    
    let searchQuery = '';
    let filteredStudents = [];
    let checkedInStudents = new Set();
    
    onMount(async () => {
        const userDataStr = sessionStorage.getItem('user');
        if (!userDataStr) {
            goto('/');
            return;
        }
        
        user = JSON.parse(userDataStr);
        if (user.role !== 'Chef') {
            goto('/');
            return;
        }
        
        await loadData();
        refreshInterval = setInterval(loadData, 30000);

        return () => {
            if (refreshInterval) clearInterval(refreshInterval);
        };
    });

    async function loadData() {
        await Promise.all([
            loadStudents(),
            loadTodayCheckins()
        ]);
        updateCheckedInStudents();
    }

    async function loadStudents() {
        try {
            const response = await fetch('/api/chef/students');
            if (response.ok) {
                students = await response.json();
                updateFilteredStudents();
            }
        } catch (error) {
            console.error('Error loading students:', error);
        }
    }

    async function loadTodayCheckins() {
        try {
            const response = await fetch('/api/chef/today-checkins');
            if (response.ok) {
                todayCheckins = await response.json();
            }
        } catch (error) {
            console.error('Error loading today\'s checkins:', error);
        }
    }

    function updateCheckedInStudents() {
        checkedInStudents = new Set(
            todayCheckins.map(checkin => checkin.studentId)
        );
    }

    function updateFilteredStudents() {
        if (!searchQuery) {
            filteredStudents = students;
            return;
        }
        
        const query = searchQuery.toLowerCase();
        filteredStudents = students.filter(student => 
            student.name.toLowerCase().includes(query) ||
            student.email.toLowerCase().includes(query)
        );
    }

    async function checkInStudent(studentId) {
        try {
            const response = await fetch('/api/chef/checkin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    studentId,
                    chefId: user.id
                })
            });

            if (response.ok) {
                await loadData();
            }
        } catch (error) {
            console.error('Error checking in student:', error);
        }
    }

    $: {
        searchQuery;
        updateFilteredStudents();
    }
</script>

<div class="page-container">
    <nav class="top-nav">
        <h1>Chef Dashboard</h1>
        <div class="user-info">
            <span>Chef on duty:</span>
            <span class="badge">{user?.name}</span>
        </div>
    </nav>

    <main class="main-content">
        <!-- Search Bar -->
        <div class="search-container">
            <div class="search-box">
                <span class="search-icon">🔍</span>
                <input
                    type="text"
                    placeholder="Search students by name or email..."
                    bind:value={searchQuery}
                />
            </div>
        </div>

        <!-- Stats Overview -->
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Total Students</h3>
                <p class="stat-value">{students.length}</p>
            </div>
            <div class="stat-card">
                <h3>Checked In Today</h3>
                <p class="stat-value success">{todayCheckins.length}</p>
            </div>
            <div class="stat-card">
                <h3>Not Checked In</h3>
                <p class="stat-value danger">{students.length - todayCheckins.length}</p>
            </div>
        </div>

        <div class="grid">
            <!-- Today's Check-ins -->
            <div class="card">
                <div class="card-header">
                    <h2>Today's Meal Check-ins</h2>
                    <p class="subtitle">Students who have checked in for meals today</p>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Check-in Time</th>
                                <th>Checked By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each todayCheckins as checkin}
                                <tr>
                                    <td>{checkin.studentName}</td>
                                    <td>{new Date(checkin.checkInTime).toLocaleString()}</td>
                                    <td>{checkin.chefName}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- All Students -->
            <div class="card">
                <div class="card-header">
                    <h2>All Students</h2>
                    <p class="subtitle">Complete list of registered students</p>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each filteredStudents as student}
                                <tr>
                                    <td>{student.name}</td>
                                    <td>{student.email}</td>
                                    <td>
                                        {#if checkedInStudents.has(student.id)}
                                            <span class="status-badge success">Checked In</span>
                                        {:else}
                                            <span class="status-badge danger">Not Checked In</span>
                                        {/if}
                                    </td>
                                    <td>
                                        {#if !checkedInStudents.has(student.id)}
                                            <button class="btn btn-success" on:click={() => checkInStudent(student.id)}>
                                                <span class="icon">✓</span>
                                                Check In
                                            </button>
                                        {/if}
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </main>
</div>

<style>
    .page-container {
        min-height: 100vh;
        background-color: #f5f7fa;
    }

    .top-nav {
        background: white;
        padding: 1rem 2rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .top-nav h1 {
        font-size: 1.5rem;
        font-weight: bold;
        color: #2c3e50;
        margin: 0;
    }

    .user-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .badge {
        background-color: #e3f2fd;
        color: #1976d2;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.875rem;
        font-weight: 500;
    }

    .main-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }

    .search-container {
        margin-bottom: 2rem;
    }

    .search-box {
        position: relative;
        max-width: 600px;
        margin: 0 auto;
    }

    .search-icon {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: #666;
    }

    .search-box input {
        width: 100%;
        padding: 0.75rem 1rem 0.75rem 2.5rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 1rem;
        transition: all 0.3s ease;
    }

    .search-box input:focus {
        outline: none;
        border-color: #1976d2;
        box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .stat-card {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        text-align: center;
    }

    .stat-card h3 {
        color: #666;
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
    }

    .stat-value {
        font-size: 2rem;
        font-weight: bold;
        color: #2c3e50;
    }

    .stat-value.success { color: #2ecc71; }
    .stat-value.danger { color: #e74c3c; }

    .grid {
        display: grid;
        gap: 2rem;
    }

    .card {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        overflow: hidden;
    }

    .card-header {
        padding: 1.5rem;
        border-bottom: 1px solid #eee;
    }

    .card-header h2 {
        font-size: 1.25rem;
        color: #2c3e50;
        margin: 0;
    }

    .subtitle {
        color: #666;
        font-size: 0.875rem;
        margin-top: 0.25rem;
    }

    .table-container {
        overflow-x: auto;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th {
        background-color: #f8f9fa;
        color: #666;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 1rem;
        text-align: left;
    }

    td {
        padding: 1rem;
        border-top: 1px solid #eee;
        color: #2c3e50;
    }

    tr:hover {
        background-color: #f8f9fa;
    }

    .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-success {
        background-color: #2ecc71;
        color: white;
    }

    .btn:hover {
        opacity: 0.9;
        transform: translateY(-1px);
    }

    .status-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 500;
    }

    .status-badge.success {
        background-color: #e8f5e9;
        color: #2ecc71;
    }

    .status-badge.danger {
        background-color: #ffeaea;
        color: #e74c3c;
    }

    .icon {
        font-size: 1rem;
    }

    @media (max-width: 768px) {
        .main-content {
            padding: 1rem;
        }

        .stats-grid {
            grid-template-columns: 1fr;
        }

        .top-nav {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
        }
    }
</style> 