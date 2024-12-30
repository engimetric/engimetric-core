import { Pool } from 'pg';
import dotenv from 'dotenv';
import logger from './logger';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false,
    },
});

/**
 * Get the sync state for a specific integration and team.
 */
export const getSyncState = async (teamId: number, integration: string) => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `SELECT * FROM sync_states WHERE team_id = $1 AND integration = $2`,
            [teamId, integration],
        );
        return result.rows[0] || null;
    } catch (error) {
        logger.error('❌ Failed to get sync state:', error);
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Mark sync as starting, set initial timestamps.
 */
export const markSyncStart = async (teamId: number, integration: string) => {
    const client = await pool.connect();
    try {
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
    } catch (error) {
        logger.error('❌ Failed to mark sync start:', error);
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Update the heartbeat timestamp to indicate active sync.
 */
export const updateHeartbeat = async (teamId: number, integration: string) => {
    const client = await pool.connect();
    try {
        await client.query(
            `UPDATE sync_states SET last_heartbeat_at = NOW() WHERE team_id = $1 AND integration = $2`,
            [teamId, integration],
        );
    } catch (error) {
        logger.error('❌ Failed to update heartbeat:', error);
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Mark sync as completed.
 */
export const markSyncComplete = async (teamId: number, integration: string) => {
    const client = await pool.connect();
    try {
        await client.query(
            `UPDATE sync_states SET is_syncing = FALSE, last_synced_at = NOW() WHERE team_id = $1 AND integration = $2`,
            [teamId, integration],
        );
    } catch (error) {
        logger.error('❌ Failed to mark sync complete:', error);
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Mark sync as failed.
 */
export const markSyncFailed = async (teamId: number, integration: string) => {
    const client = await pool.connect();
    try {
        await client.query(
            `UPDATE sync_states SET is_syncing = FALSE, last_failed_at = NOW() WHERE team_id = $1 AND integration = $2`,
            [teamId, integration],
        );
    } catch (error) {
        logger.error('❌ Failed to mark sync failed:', error);
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Detect stale syncs (older than a threshold, e.g., 10 minutes).
 */
export const detectStaleSyncs = async () => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `SELECT team_id, integration FROM sync_states 
             WHERE is_syncing = TRUE AND last_heartbeat_at < NOW() - INTERVAL '10 minutes'`,
        );
        return result.rows;
    } catch (error) {
        logger.error('❌ Failed to detect stale syncs:', error);
        throw error;
    } finally {
        client.release();
    }
};
