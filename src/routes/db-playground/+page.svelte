<script>
    let query = `SELECT * FROM users 
WHERE role = 'Student'`;
    let results = [];
    let message = '';
    let error = '';
    let loading = false;
    let columns = [];

    const predefinedQueries = {
        "User Queries": {
            "Create User": `INSERT INTO users (name, email, password, phoneNumber, role)
VALUES ('John Doe', 'john@example.com', '123456', '+1234567890', 'Student')`,
            "Get User by Email": `SELECT * FROM users WHERE email = 'admin@dorm.com'`,
            "Update User Password by ID": `UPDATE users SET password = 'newpassword' WHERE id = 1`,
            "Update User Password by Email": `UPDATE users SET password = 'newpassword' WHERE email = 'john.smith@student.edu'`,
            "Get All Users": `SELECT * FROM users`
        },
        "Admin Queries": {
            "Get All Students": `SELECT * FROM users WHERE role = 'Student'`,
            "Get All Complaints with User Info": `SELECT c.*, u.name as userName, u.email as userEmail 
FROM complaints c 
JOIN users u ON c.userId = u.id 
ORDER BY submittedTime DESC`,
            "Get Travel Requests with Student Info": `SELECT t.*, u.name as studentName, u.email as studentEmail 
FROM travel_tickets t 
JOIN users u ON t.studentId = u.id 
ORDER BY requestTime DESC`,
            "Update Travel Request": `UPDATE travel_tickets 
SET status = 'Approved', adminId = 1 
WHERE id = 1`,
            "Get Entry/Exit Logs": `SELECT l.*, 
       s.name as studentName, 
       s.email as studentEmail,
       sec.name as securityName
FROM entry_exit_logs l 
JOIN users s ON l.studentId = s.id 
JOIN users sec ON l.securityId = sec.id 
ORDER BY entryTime DESC`,
            "Get Meal Checkins": `SELECT m.*, 
       s.name as studentName, 
       s.email as studentEmail,
       c.name as chefName
FROM meal_checkins m 
JOIN users s ON m.studentId = s.id 
JOIN users c ON m.chefId = c.id 
ORDER BY checkInTime DESC`
        },
        "Stats Queries": {
            "Get Student Count": `SELECT COUNT(*) as count FROM users WHERE role = 'Student'`,
            "Get Pending Travel Requests": `SELECT COUNT(*) as count FROM travel_tickets WHERE status = 'Pending'`,
            "Get Today's Meal Checkins": `SELECT COUNT(*) as count 
FROM meal_checkins 
WHERE date(checkInTime) = date('now')`,
            "Get Currently Out Students": `SELECT COUNT(*) as count 
FROM entry_exit_logs 
WHERE exitTime IS NOT NULL AND entryTime IS NULL`
        },
        "Table Schemas": {
            "Users Table": `SELECT sql FROM sqlite_master WHERE type='table' AND name='users'`,
            "Meal Checkins Table": `SELECT sql FROM sqlite_master WHERE type='table' AND name='meal_checkins'`,
            "Travel Tickets Table": `SELECT sql FROM sqlite_master WHERE type='table' AND name='travel_tickets'`,
            "Entry Exit Logs Table": `SELECT sql FROM sqlite_master WHERE type='table' AND name='entry_exit_logs'`,
            "Complaints Table": `SELECT sql FROM sqlite_master WHERE type='table' AND name='complaints'`
        }
    };

    async function executeQuery() {
        loading = true;
        error = '';
        message = '';
        try {
            const response = await fetch('/api/db-playground/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query })
            });

            const data = await response.json();
            
            if (response.ok) {
                if (data.results?.length > 0) {
                    results = data.results;
                    columns = Object.keys(results[0]);
                } else {
                    results = [];
                    columns = [];
                }
                if (data.message) {
                    message = data.message;
                }
            } else {
                error = data.message || 'Error executing query';
                results = [];
                columns = [];
            }
        } catch (e) {
            error = 'Error executing query';
            results = [];
            columns = [];
        } finally {
            loading = false;
        }
    }

    function setQuery(newQuery) {
        query = newQuery;
    }
</script>

<div class="container">
    <h1>Database Playground</h1>
    <p class="description">Test your SQL queries against the database and see the results.</p>

    <div class="playground-container">
        <div class="query-section">
            <div class="card query-card">
                <h2>SQL Query</h2>
                <textarea 
                    class="form-input query-editor"
                    bind:value={query}
                    placeholder="Enter your SQL query here..."
                    rows="10"
                ></textarea>
                <button 
                    class="btn btn-primary"
                    on:click={executeQuery}
                    disabled={loading}
                >
                    {loading ? 'Executing...' : 'Execute Query'}
                </button>
            </div>

            <div class="help-section">
                <h3>Predefined Queries</h3>
                <div class="predefined-queries-grid">
                    {#each Object.entries(predefinedQueries) as [category, queries]}
                        <div class="query-category">
                            <h4>{category}</h4>
                            <div class="query-buttons">
                                {#each Object.entries(queries) as [name, queryText]}
                                    <button 
                                        class="btn btn-secondary btn-sm"
                                        on:click={() => setQuery(queryText)}
                                    >
                                        {name}
                                    </button>
                                {/each}
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>

        <div class="results-section">
            <div class="card results-card">
                <h2>Results</h2>
                {#if error}
                    <div class="alert alert-error">
                        {error}
                    </div>
                {/if}

                {#if message}
                    <div class="alert alert-success">
                        {message}
                    </div>
                {/if}

                {#if results.length > 0}
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    {#each columns as column}
                                        <th>{column}</th>
                                    {/each}
                                </tr>
                            </thead>
                            <tbody>
                                {#each results as row}
                                    <tr>
                                        {#each columns as column}
                                            <td>
                                                {#if row[column] instanceof Date}
                                                    {row[column].toLocaleString()}
                                                {:else if typeof row[column] === 'boolean'}
                                                    <span class="badge badge-{row[column] ? 'success' : 'danger'}">
                                                        {row[column] ? 'Yes' : 'No'}
                                                    </span>
                                                {:else}
                                                    {row[column]}
                                                {/if}
                                            </td>
                                        {/each}
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                    <p class="results-count">
                        Found {results.length} result{results.length === 1 ? '' : 's'}
                    </p>
                {:else if !error && !loading && !message}
                    <p class="empty-state">No results to display. Try running a query!</p>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    .description {
        color: var(--text-secondary);
        margin-bottom: var(--space-xl);
    }

    .playground-container {
        display: grid;
        grid-template-columns: 60% 40%;
        gap: var(--space-xl);
        margin-top: var(--space-xl);
    }

    .query-section {
        display: flex;
        flex-direction: column;
        gap: var(--space-xl);
    }

    .query-card {
        position: sticky;
        top: var(--space-xl);
    }

    .query-editor {
        font-family: var(--font-mono);
        margin-bottom: var(--space-md);
        resize: vertical;
        min-height: 200px;
        width: 100%;
    }

    .help-section {
        margin-top: var(--space-xl);
    }

    .predefined-queries-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: var(--space-xl);
    }

    .query-category {
        margin-bottom: var(--space-lg);
    }

    .query-category h4 {
        color: var(--text-secondary);
        font-size: var(--text-sm);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: var(--space-sm);
    }

    .query-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-sm);
        margin-bottom: var(--space-md);
    }

    .btn-sm {
        font-size: var(--text-xs);
        padding: var(--space-xs) var(--space-sm);
    }

    .results-card {
        position: sticky;
        top: var(--space-xl);
    }

    .table-container {
        overflow-x: auto;
        max-width: 100%;
    }

    .results-count {
        margin-top: var(--space-md);
        color: var(--text-secondary);
        font-size: var(--text-sm);
        text-align: right;
    }

    @media (max-width: 1200px) {
        .playground-container {
            grid-template-columns: 1fr;
        }

        .query-card, .results-card {
            position: static;
        }
    }
</style> 