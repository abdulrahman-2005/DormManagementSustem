<script>
    let query = `-- Example: List all students
SELECT * FROM users 
WHERE role = 'Student'`;
    let results = [];
    let message = '';
    let error = '';
    let loading = false;
    let columns = [];

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
</script>

<div class="container">
    <h1>Database Playground</h1>
    <p class="description">Test your SQL queries against the database and see the results.</p>

    <div class="playground-container">
        <div class="query-section">
            <div class="card">
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
                <h3>Example Queries</h3>
                <div class="example-queries">
                    <pre>-- Select Query Example
SELECT tr.id, u.name, tr.startTime, tr.endTime, tr.status 
FROM travel_requests tr
JOIN users u ON tr.studentId = u.id</pre>

                    <pre>-- Insert Query Example
INSERT INTO complaints (userId, description) 
VALUES (1, 'Test complaint')</pre>

                    <pre>-- Update Query Example
UPDATE travel_requests 
SET status = 'Approved' 
WHERE id = 1</pre>

                    <pre>-- Delete Query Example
DELETE FROM complaints 
WHERE id = 1</pre>

                    <pre>-- Complex Query Example
WITH StudentStats AS (
    SELECT 
        u.id,
        u.name,
        COUNT(tr.id) as travelRequests,
        COUNT(c.id) as complaints
    FROM users u
    LEFT JOIN travel_requests tr ON u.id = tr.studentId
    LEFT JOIN complaints c ON u.id = c.userId
    WHERE u.role = 'Student'
    GROUP BY u.id, u.name
)
SELECT * FROM StudentStats
ORDER BY travelRequests DESC</pre>
                </div>
            </div>
        </div>

        <div class="results-section">
            <div class="card">
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
        grid-template-columns: 1fr 1fr;
        gap: var(--space-xl);
        margin-top: var(--space-xl);
    }

    .query-editor {
        font-family: var(--font-mono);
        margin-bottom: var(--space-md);
        resize: vertical;
        min-height: 200px;
    }

    .help-section {
        margin-top: var(--space-xl);
    }

    .example-queries {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
    }

    .example-queries pre {
        background-color: var(--surface);
        padding: var(--space-md);
        border-radius: var(--radius-md);
        border: 1px solid var(--border);
        font-family: var(--font-mono);
        font-size: var(--text-sm);
        overflow-x: auto;
        white-space: pre-wrap;
        word-wrap: break-word;
    }

    .results-count {
        margin-top: var(--space-md);
        color: var(--text-secondary);
        font-size: var(--text-sm);
        text-align: right;
    }

    @media (max-width: 1024px) {
        .playground-container {
            grid-template-columns: 1fr;
        }
    }
</style> 