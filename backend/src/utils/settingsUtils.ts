import { IntegrationSettings, Settings } from '../models/Settings';
import { runWithTransaction, runWithSchedulerTransaction } from './databaseUtils';

/**
 * Create or update integration settings for a team.
 * @param teamId - ID of the team.
 * @param settings - JSON object containing integration settings.
 */
export const createOrUpdateIntegrationSettings = async (
    teamId: number,
    settings: object,
    requestingUserId: number,
) => {
    return runWithTransaction(
        async (client) => {
            const query = `
            INSERT INTO settings (team_id, integrations, updated_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (team_id) DO UPDATE
            SET integrations = EXCLUDED.integrations,
                updated_at = NOW()
            RETURNING *;`;

            const values = [teamId, JSON.stringify(settings)];
            const result = await client.query(query, values);
            return result.rows[0];
        },
        { transactional: true, requestingUserId },
    );
};

/**
 * Fetch all integration settings.
 *
 * @returns An array of all integration settings
 * @example
 * ```javascript
 * const settings = await fetchAllIntegrationSettings();
 * logger.info(settings);
 * // Output: [
 * //   {
 * //     teamId: 1,
 * //     createdAt: '2021-08-01T00:00:00.000Z',
 * //     updatedAt: '2021-08-01T00:00:00.000Z',
 * //     integrations: {
 * //       github: {
 * //         enabled: true,
 * //         token: 'abc123'
 * //       }
 * //     }
 * //   }
 * // ]
 * ```
 */
export const fetchAllIntegrationSettings = async (requestingUserId: number): Promise<Settings[]> => {
    return runWithTransaction(
        async (client) => {
            const result = await client.query('SELECT * FROM settings');
            return result.rows.map((row) => ({
                teamId: row.team_id,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                integrations: row.integrations,
            }));
        },
        { transactional: false, requestingUserId },
    );
};

/**
 * Fetch integration settings for a specific team.
 *
 * @param teamId - The ID of the team
 * @returns The settings object or undefined if not found
 * @example
 * ```javascript
 * const settings = await fetchIntegrationSettingsByTeamId(1);
 * logger.info(settings);
 * // Output: {
 * //   teamId: 1,
 * //   createdAt: '2021-08-01T00:00:00.000Z',
 * //   updatedAt: '2021-08-01T00:00:00.000Z',
 * //   integrations: {
 * //     github: {
 * //       enabled: true,
 * //       token
 * //     }
 * //   }
 * // }
 * ```
 */
export const fetchIntegrationSettingsByTeamId = async (
    teamId: number,
    requestingUserId?: number,
): Promise<Settings | undefined> => {
    const runTransaction = requestingUserId ? runWithTransaction : runWithSchedulerTransaction;
    return runTransaction(
        async (client) => {
            const result = await client.query('SELECT * FROM settings WHERE team_id = $1', [teamId]);
            if (result.rows.length === 0) return undefined;

            const row = result.rows[0];
            return {
                teamId: row.team_id,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                integrations: row.integrations,
            };
        },
        { transactional: false, requestingUserId },
    );
};

/**
 * Fetch a specific integration setting by team and integration name.
 *
 * @param teamId - The ID of the team
 * @param integrationName - The name of the integration
 * @returns IntegrationSettings object or undefined if not found
 * @example
 * ```javascript
 * const settings = await fetchIntegrationSettingByName(1, 'github');
 * logger.info(settings);
 * // Output: {
 * //   enabled: true,
 * //   token: 'abc123'
 * // }
 * ```
 */
export const fetchIntegrationSettingByName = async (
    teamId: number,
    integrationName: string,
    requestingUserId?: number,
): Promise<IntegrationSettings | undefined> => {
    const runTransaction = requestingUserId ? runWithTransaction : runWithSchedulerTransaction;
    return runTransaction(
        async (client) => {
            const result = await client.query('SELECT integrations FROM settings WHERE team_id = $1', [
                teamId,
            ]);

            if (result.rows.length === 0) {
                return undefined;
            }
            return result.rows[0].integrations?.[integrationName];
        },
        { transactional: false, requestingUserId },
    );
};

/**
 * Delete all integration settings for a team.
 *
 * @param teamId - The ID of the team
 * @returns Promise that resolves when the settings are deleted
 * @example
 * ```javascript
 * await deleteIntegrationSettings(1);
 * ```
 * @throws Error if the settings could not be deleted
 */
export const deleteIntegrationSettings = async (teamId: number, requestingUserId: number): Promise<void> => {
    return runWithTransaction(
        async (client) => {
            await client.query('DELETE FROM settings WHERE team_id = $1', [teamId]);
        },
        { transactional: false, requestingUserId },
    );
};

/**
 * Delete a specific integration setting by name.
 *
 * @param teamId - The ID of the team
 * @param integrationName - The name of the integration to delete
 * @param requestingUserId - The ID of the requesting user (for RLS)
 * @returns Promise that resolves when the setting is deleted
 */
export const deleteIntegrationSettingByName = async (
    teamId: number,
    integrationName: string,
    requestingUserId: number,
): Promise<void> => {
    return runWithTransaction(
        async (client) => {
            // Fetch the current integrations
            const result = await client.query('SELECT integrations FROM settings WHERE team_id = $1;', [
                teamId,
            ]);

            if (result.rows.length === 0) {
                throw new Error(`Settings not found for teamId: ${teamId}`);
            }

            const integrations = result.rows[0].integrations;

            if (!integrations || !integrations[integrationName]) {
                throw new Error(
                    `Integration '${integrationName}' not found in settings for teamId: ${teamId}`,
                );
            }

            // Remove the integration
            delete integrations[integrationName];

            // Update the integrations
            await client.query('UPDATE settings SET integrations = $1, updated_at = $2 WHERE team_id = $3;', [
                JSON.stringify(integrations),
                new Date(),
                teamId,
            ]);
        },
        { transactional: true, requestingUserId },
    );
};
