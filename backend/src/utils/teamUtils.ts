import { Team } from '../models/Team';
import { Pool } from 'pg';
import dotenv from 'dotenv';

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
        console.error('Error creating/updating team:', error);
        throw error;
    }
};

/**
 * Fetch all teams from the database.
 * @returns Promise that resolves with an array of all teams from the database.
 * @throws Error if the teams could not be fetched.
 */
export const fetchAllTeams = async (): Promise<Team[]> => {
    const result = await pool.query('SELECT * FROM teams');
    return result.rows;
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

    return result.rows[0];
};

/**
 * Delete a team by its ID.
 *
 * @param teamId - The ID of the team to delete.
 * @throws Error if the team could not be deleted.
 * @returns Promise that resolves when the team is deleted.
 */
export const deleteTeam = async (teamId: number): Promise<void> => {
    await pool.query('DELETE FROM teams WHERE id = $1', [teamId]);
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
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error finding team by name or slug:', error);
        throw error;
    }
};
