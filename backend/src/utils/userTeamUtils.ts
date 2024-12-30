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
 * Fetch teams associated with a user.
 * @param userId - ID of the user.
 * @returns A list of teams associated with the user.
 */
export const fetchUserTeams = async (userId: number) => {
    const query = `
        SELECT t.id, t.name, t.slug, ut.role 
        FROM teams t
        JOIN user_teams ut ON t.id = ut.team_id
        WHERE ut.user_id = $1;
    `;

    const values = [userId];

    try {
        const result = await pool.query(query, values);
        return result.rows;
    } catch (error) {
        logger.error('Error fetching user teams:', error);
        throw error;
    }
};

/**
 * Add a user to a team with a specified role.
 * @param userId - ID of the user.
 * @param teamId - ID of the team.
 * @param role - Role of the user in the team (e.g., 'admin', 'member').
 */
export const addUserToTeam = async (userId: number, teamId: number, role: string = 'member') => {
    const query = `
        INSERT INTO user_teams (user_id, team_id, role, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (user_id, team_id) DO UPDATE
        SET role = EXCLUDED.role,
            updated_at = NOW()
        RETURNING *;
    `;

    const values = [userId, teamId, role];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        logger.error('Error adding user to team:', error);
        throw error;
    }
};

/**
 * Remove a user from a team
 * @param userId - The ID of the user
 * @param teamId - The ID of the team
 */
export const removeUserFromTeam = async (userId: number, teamId: number) => {
    try {
        await pool.query(
            `
            DELETE FROM user_teams
            WHERE user_id = $1 AND team_id = $2
            `,
            [userId, teamId],
        );
    } catch (error) {
        logger.error('Error removing user from team:', error);
        throw new Error('Failed to remove user from team');
    }
};

/**
 * Check if a user is part of a specific team
 * @param userId - The ID of the user
 * @param teamId - The ID of the team
 * @returns Boolean indicating membership status
 */
export const isUserInTeam = async (userId: number, teamId: number): Promise<boolean> => {
    try {
        const result = await pool.query(
            `
            SELECT 1 FROM user_teams
            WHERE user_id = $1 AND team_id = $2
            LIMIT 1
            `,
            [userId, teamId],
        );

        if (!result || !result.rowCount) {
            return false;
        }

        return result?.rowCount > 0;
    } catch (error) {
        logger.error('Error checking user-team membership:', error);
        throw new Error('Failed to verify user-team membership');
    }
};

/**
 * Get user role in a specific team
 * @param userId - The ID of the user
 * @param teamId - The ID of the team
 * @returns User's role in the team
 */
export const getUserTeamRole = async (userId: number, teamId: number): Promise<string | null> => {
    try {
        const result = await pool.query(
            `
            SELECT role FROM user_teams
            WHERE user_id = $1 AND team_id = $2
            LIMIT 1
            `,
            [userId, teamId],
        );

        return result.rows[0]?.role || null;
    } catch (error) {
        logger.error('Error fetching user role in team:', error);
        throw new Error('Failed to fetch user role in team');
    }
};
