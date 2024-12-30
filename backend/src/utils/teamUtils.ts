import { Team } from '../models/Team';
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
 * Create or update a team.
 * @param team - Team object with necessary fields.
 */

/**
 * Create or update a team by its slug.
 * If the slug doesn't exist, insert a new team (auto-generated id).
 * If the slug already exists, update fields.
 * @param team - The team object containing at least slug, name, etc.
 */
export const createOrUpdateTeam = async (team: {
    slug: string;
    name: string;
    description?: string;
    ownerId?: number | null;
}) => {
    const query = `
      INSERT INTO teams (slug, name, description, owner_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT (slug) DO UPDATE
        SET name = EXCLUDED.name,
            description = EXCLUDED.description,
            owner_id = EXCLUDED.owner_id,
            updated_at = NOW()
      RETURNING *;
    `;

    const values = [team.slug, team.name, team.description ?? null, team.ownerId ?? null];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        logger.error('Error creating/updating team:', error);
        throw error;
    }
};

/**
 * Ensure the team has default records in other tables, e.g. `settings`, `subscriptions`.
 * If the records do not exist, create them.
 */
export const ensureTeamHasDefaults = async (teamId: number): Promise<void> => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Insert a default subscription row if none exists
        //    Make sure you have a UNIQUE constraint on (team_id) in subscriptions
        //    if you want ON CONFLICT DO NOTHING to work.
        await client.query(
            `
            INSERT INTO subscriptions (team_id, plan_type, status, billing_cycle, start_date, created_at, updated_at)
            VALUES ($1, 'free', 'active', NULL, NOW(), NOW(), NOW())
            ON CONFLICT (team_id) DO NOTHING
            `,
            [teamId],
        );

        // 2. Insert a default settings row if none exists
        //    Similarly, ensure there's a UNIQUE constraint on (team_id) in settings.
        await client.query(
            `
            INSERT INTO settings (team_id, created_at, updated_at, integrations)
            VALUES ($1, NOW(), NOW(), '{}')
            ON CONFLICT (team_id) DO NOTHING
            `,
            [teamId],
        );

        // 3. Insert other default rows (sync_states, etc.) if needed
        await client.query(
            `
            INSERT INTO sync_states (team_id, integration, is_syncing, last_started_at, last_heartbeat_at, last_synced_at, last_failed_at)
            VALUES ($1, 'github', false, NULL, NULL, NULL, NULL)
            ON CONFLICT DO NOTHING
          `,
            [teamId],
        );

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Fetch all teams from the database.
 * @returns Promise that resolves with an array of all teams from the database.
 * @throws Error if the teams could not be fetched.
 */
export const fetchAllTeams = async (): Promise<Team[]> => {
    const result = await pool.query('SELECT * FROM teams');
    return result.rows.map((team) => ({
        id: team.id,
        slug: team.slug,
        name: team.name,
        description: team.description,
        ownerId: team.owner_id,
        isFrozen: team.is_frozen,
        frozenReason: team.frozen_reason,
        subscriptionId: team.subscription_id,
        createdAt: team.created_at,
        updatedAt: team.updated_at,
    }));
};

/**
 * Fetch a single team by its ID.
 *
 * @param teamId - The ID of the team.
 * @returns A team object if found, otherwise `undefined`.
 * @throws Error if the team could not be fetched.
 */
export const fetchTeamById = async (teamId: number): Promise<Team | undefined> => {
    const result = await pool.query('SELECT * FROM teams WHERE id = $1', [teamId]);

    if (result.rows.length === 0) {
        return undefined;
    }

    const row = result.rows[0];

    return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        description: row.description,
        ownerId: row.owner_id,
        isFrozen: row.is_frozen,
        frozenReason: row.frozen_reason,
        subscriptionId: row.subscription_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
};

/**
 * Delete a team by its ID.
 *
 * @param teamId - The ID of the team to delete.
 * @throws Error if the team could not be deleted.
 * @returns Promise that resolves when the team is deleted.
 */
export const deleteTeam = async (teamId: number): Promise<void> => {
    const client = await pool.connect();

    try {
        // Start transaction
        await client.query('BEGIN');

        // 1. Delete from user_teams
        await client.query('DELETE FROM user_teams WHERE team_id = $1', [teamId]);

        // 2. Delete from team_members
        await client.query('DELETE FROM team_members WHERE team_id = $1', [teamId]);

        // 3. Delete from subscriptions
        await client.query('DELETE FROM subscriptions WHERE team_id = $1', [teamId]);

        // 4. Delete from sync_states
        await client.query('DELETE FROM sync_states WHERE team_id = $1', [teamId]);

        // 5. Delete from settings (if you store them in a table referencing team_id)
        //    This depends on whether your "Settings" interface is backed by a table.
        //    If so:
        await client.query('DELETE FROM settings WHERE team_id = $1', [teamId]);

        // 6. Finally, delete the team itself
        await client.query('DELETE FROM teams WHERE id = $1', [teamId]);

        // Commit transaction
        await client.query('COMMIT');
    } catch (error) {
        // If something fails, rollback the transaction
        await client.query('ROLLBACK');
        throw error;
    } finally {
        // Release the client back to the pool
        client.release();
    }
};

/**
 * Find a team by name or slug.
 * @param teamNameOrSlug - The team name or slug.
 * @returns The matching team object or null.
 */
export const findTeamByNameOrSlug = async (teamNameOrSlug: string) => {
    const query = `
        SELECT * FROM teams 
        WHERE LOWER(name) = LOWER($1) 
        OR LOWER(slug) = LOWER($1)
        LIMIT 1;
    `;
    const values = [teamNameOrSlug];

    try {
        const result = await pool.query(query, values);
        const row = result.rows[0];
        return row
            ? {
                  id: row.id,
                  slug: row.slug,
                  name: row.name,
                  description: row.description,
                  ownerId: row.owner_id,
                  isFrozen: row.is_frozen,
                  frozenReason: row.frozen_reason,
                  subscriptionId: row.subscription_id,
                  createdAt: row.created_at,
                  updatedAt: row.updated_at,
              }
            : null;
    } catch (error) {
        logger.error('Error finding team by name or slug:', error);
        throw error;
    }
};
