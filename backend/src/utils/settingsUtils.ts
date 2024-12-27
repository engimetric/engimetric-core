import { Pool } from 'pg';
import { IntegrationSettings, Settings } from '../models/Settings';
import { defaultIntegrationSettings } from './defaultIntegrationSettings';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // Set to true if you have a valid SSL cert
    },
});

/**
 * Create or update integration settings for a team.
 * @param teamId - ID of the team.
 * @param settings - JSON object containing integration settings.
 */
export const createOrUpdateIntegrationSettings = async (teamId: number, settings: object) => {
    const query = `
        INSERT INTO settings (team_id, integrations, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (team_id) DO UPDATE
        SET integrations = EXCLUDED.integrations,
            updated_at = NOW()
        RETURNING *;
    `;

    const values = [teamId, JSON.stringify(settings)];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error creating/updating integration settings:', error);
        throw error;
    }
};

/**
 * Fetch all integration settings.
 *
 * @returns An array of all integration settings
 * @example
 * ```javascript
 * const settings = await fetchAllIntegrationSettings();
 * console.log(settings);
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
export const fetchAllIntegrationSettings = async (): Promise<Settings[]> => {
    const result = await pool.query('SELECT * FROM settings');
    return result.rows.map((row) => ({
        teamId: row.team_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        integrations: row.integrations,
    }));
};

/**
 * Fetch integration settings for a specific team.
 *
 * @param teamId - The ID of the team
 * @returns The settings object or undefined if not found
 * @example
 * ```javascript
 * const settings = await fetchIntegrationSettingsByTeamId(1);
 * console.log(settings);
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
export const fetchIntegrationSettingsByTeamId = async (teamId: number): Promise<Settings | undefined> => {
    const result = await pool.query('SELECT * FROM settings WHERE team_id = $1', [teamId]);
    if (result.rows.length === 0) return undefined;

    const row = result.rows[0];
    return {
        teamId: row.team_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        integrations: row.integrations,
    };
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
 * console.log(settings);
 * // Output: {
 * //   enabled: true,
 * //   token: 'abc123'
 * // }
 * ```
 */
export const fetchIntegrationSettingByName = async (
    teamId: number,
    integrationName: string,
): Promise<IntegrationSettings | undefined> => {
    const result = await pool.query('SELECT integrations FROM settings WHERE team_id = $1', [teamId]);
    if (result.rows.length === 0) return undefined;

    return result.rows[0].integrations?.[integrationName];
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
export const deleteIntegrationSettings = async (teamId: number): Promise<void> => {
    await pool.query('DELETE FROM settings WHERE team_id = $1', [teamId]);
};

/**
 * Delete a specific integration setting by name.
 *
 * @param teamId - The ID of the team
 * @param integrationName - The name of the integration to delete
 * @returns Promise that resolves when the setting is deleted
 * @example
 * ```javascript
 * await deleteIntegrationSettingByName(1, 'github');
 * ```
 * @throws Error if the setting could not be deleted
 */
export const deleteIntegrationSettingByName = async (
    teamId: number,
    integrationName: string,
): Promise<void> => {
    const result = await pool.query('SELECT integrations FROM settings WHERE team_id = $1', [teamId]);
    if (result.rows.length === 0) return;

    const integrations = result.rows[0].integrations;
    delete integrations[integrationName];

    await pool.query('UPDATE settings SET integrations = $1, updated_at = $2 WHERE team_id = $3', [
        JSON.stringify(integrations),
        new Date(),
        teamId,
    ]);
};
