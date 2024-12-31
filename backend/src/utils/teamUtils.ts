import { Team } from '../models/Team';
import { runWithTransaction, runWithSchedulerTransaction } from './databaseUtils';

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
export const createOrUpdateTeam = async (
    team: {
        slug: string;
        name: string;
        description?: string;
        ownerId?: number | null;
    },
    requestingUserId: number,
) => {
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

    return runWithTransaction(
        async (client) => {
            const result = await client.query(query, values);

            return result.rows[0].map((row: any) => ({
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
            }));
        },
        { transactional: true, requestingUserId },
    );
};

/**
 * Ensure the team has default records in other tables, e.g. `settings`, `subscriptions`.
 * If the records do not exist, create them.
 */
export const ensureTeamHasDefaults = async (teamId: number, requestingUserId: number): Promise<void> => {
    return runWithTransaction(
        async (client) => {
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
        },
        { transactional: true, requestingUserId },
    );
};

/**
 * Fetch all teams from the database.
 * @returns Promise that resolves with an array of all teams from the database.
 * @throws Error if the teams could not be fetched.
 */
export const fetchAllTeams = async (): Promise<Team[]> => {
    return runWithSchedulerTransaction(
        async (client) => {
            const result = await client.query('SELECT * FROM teams');
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
        },
        { transactional: false },
    );
};

/**
 * Fetch a single team by its ID.
 *
 * @param teamId - The ID of the team.
 * @returns A team object if found, otherwise `undefined`.
 * @throws Error if the team could not be fetched.
 */
export const fetchTeamById = async (teamId: number, requestingUserId: number): Promise<Team | undefined> => {
    return runWithTransaction(
        async (client) => {
            const result = await client.query('SELECT * FROM teams WHERE id = $1', [teamId]);

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
        },
        { transactional: false, requestingUserId },
    );
};

/**
 * Delete a team by its ID.
 *
 * @param teamId - The ID of the team to delete.
 * @throws Error if the team could not be deleted.
 * @returns Promise that resolves when the team is deleted.
 */
export const deleteTeam = async (teamId: number, requestingUserId: number): Promise<void> => {
    return runWithTransaction(
        async (client) => {
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
        },
        { transactional: true, requestingUserId },
    );
};

/**
 * Find a team by name or slug.
 * @param teamNameOrSlug - The team name or slug.
 * @returns The matching team object or null.
 */
export const findTeamByNameOrSlug = async (teamNameOrSlug: string, requestingUserId: number) => {
    return runWithTransaction(
        async (client) => {
            const result = await client.query(
                'SELECT * FROM teams WHERE LOWER(name) = LOWER($1) OR LOWER(slug) = LOWER($1) LIMIT 1;',
                [teamNameOrSlug],
            );
            await client.query('COMMIT');
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
        },
        { transactional: false, requestingUserId },
    );
};
