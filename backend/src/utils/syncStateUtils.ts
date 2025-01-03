import { runWithSchedulerTransaction } from './databaseUtils';

/**
 * Get the sync state for a specific integration and team.
 */
export const getSyncState = async (teamId: number, integration: string) => {
    return runWithSchedulerTransaction(
        async (client) => {
            const result = await client.query(
                `SELECT * FROM sync_states WHERE team_id = $1 AND integration = $2`,
                [teamId, integration],
            );
            return result.rows[0] || null;
        },
        { transactional: false },
    );
};

/**
 * Mark sync as starting, set initial timestamps.
 */
export const markSyncStart = async (teamId: number, integration: string) => {
    return runWithSchedulerTransaction(
        async (client) => {
            await client.query(
                `INSERT INTO sync_states (team_id, integration, is_syncing, last_started_at, last_heartbeat_at)
             VALUES ($1, $2, TRUE, NOW(), NOW())
             ON CONFLICT (team_id, integration)
             DO UPDATE SET
               is_syncing = TRUE,
               last_started_at = NOW(),
               last_heartbeat_at = NOW()`,
                [teamId, integration],
            );
        },
        { transactional: true },
    );
};

/**
 * Update the heartbeat timestamp to indicate active sync.
 */
export const updateHeartbeat = async (teamId: number, integration: string) => {
    return runWithSchedulerTransaction(
        async (client) => {
            await client.query(
                `UPDATE sync_states SET last_heartbeat_at = NOW() WHERE team_id = $1 AND integration = $2`,
                [teamId, integration],
            );
        },
        { transactional: true },
    );
};

/**
 * Mark sync as completed.
 */
export const markSyncComplete = async (teamId: number, integration: string) => {
    return runWithSchedulerTransaction(
        async (client) => {
            await client.query(
                `UPDATE sync_states SET is_syncing = FALSE, last_synced_at = NOW() WHERE team_id = $1 AND integration = $2`,
                [teamId, integration],
            );
        },
        { transactional: true },
    );
};

/**
 * Mark sync as failed.
 */
export const markSyncFailed = async (teamId: number, integration: string) => {
    return runWithSchedulerTransaction(
        async (client) => {
            await client.query(
                `UPDATE sync_states SET is_syncing = FALSE, last_failed_at = NOW() WHERE team_id = $1 AND integration = $2`,
                [teamId, integration],
            );
        },
        { transactional: true },
    );
};

/**
 * Detect stale syncs (older than a threshold, e.g., 10 minutes).
 */
export const detectStaleSyncs = async () => {
    return runWithSchedulerTransaction(
        async (client) => {
            const result = await client.query(
                `SELECT team_id, integration FROM sync_states 
             WHERE is_syncing = TRUE AND last_heartbeat_at < NOW() - INTERVAL '10 minutes'`,
            );
            return result.rows;
        },
        { transactional: true },
    );
};
