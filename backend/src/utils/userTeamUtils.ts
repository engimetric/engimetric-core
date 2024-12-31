import logger from './logger';
import { runWithTransaction } from './databaseUtils';

/**
 * Fetch teams associated with a user.
 * @param userId - ID of the user.
 * @returns A list of teams associated with the user.
 */
export const fetchUserTeams = async (userId: number, requestingUserId: number) => {
    const query = `
        SELECT t.id, t.name, t.slug, ut.role 
        FROM teams t
        JOIN user_teams ut ON t.id = ut.team_id
        WHERE ut.user_id = $1;
    `;

    const values = [userId];

    logger.info(`Fetching teams for user ID: ${userId}`);

    return runWithTransaction(
        async (client) => {
            const result = await client.query(query, values);
            return result.rows.map((row) => ({
                id: row.id,
                name: row.name,
                slug: row.slug,
                role: row.role,
            }));
        },
        { transactional: false, requestingUserId },
    );
};

/**
 * Add a user to a team with a specified role.
 * @param userId - ID of the user.
 * @param teamId - ID of the team.
 * @param role - Role of the user in the team (e.g., 'admin', 'member').
 */
export const addUserToTeam = async (
    userId: number,
    teamId: number,
    role: string = 'member',
    requestingUserId: number,
) => {
    const query = `
        INSERT INTO user_teams (user_id, team_id, role, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (user_id, team_id) DO UPDATE
        SET role = EXCLUDED.role,
            updated_at = NOW()
        RETURNING *;
    `;

    const values = [userId, teamId, role];
    return runWithTransaction(
        async (client) => {
            const result = await client.query(query, values);
            return result.rows[0];
        },
        { transactional: true, requestingUserId },
    );
};

/**
 * Remove a user from a team
 * @param userId - The ID of the user
 * @param teamId - The ID of the team
 */
export const removeUserFromTeam = async (userId: number, teamId: number, requestingUserId: number) => {
    return runWithTransaction(
        async (client) => {
            await client.query(
                `
            DELETE FROM user_teams
            WHERE user_id = $1 AND team_id = $2
            `,
                [userId, teamId],
            );
        },
        { transactional: true, requestingUserId },
    );
};

/**
 * Check if a user is part of a specific team
 * @param userId - The ID of the user
 * @param teamId - The ID of the team
 * @returns Boolean indicating membership status
 */
export const isUserInTeam = async (
    userId: number,
    teamId: number,
    requestingUserId: number,
): Promise<boolean> => {
    return runWithTransaction(
        async (client) => {
            const result = await client.query(
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
        },
        { transactional: false, requestingUserId },
    );
};

/**
 * Get user role in a specific team
 * @param userId - The ID of the user
 * @param teamId - The ID of the team
 * @returns User's role in the team
 */
export const getUserTeamRole = async (
    userId: number,
    teamId: number,
    requestingUserId: number,
): Promise<string | null> => {
    return runWithTransaction(
        async (client) => {
            const result = await client.query(
                `
            SELECT role FROM user_teams
            WHERE user_id = $1 AND team_id = $2
            LIMIT 1
            `,
                [userId, teamId],
            );
            return result.rows[0]?.role || null;
        },
        { transactional: false, requestingUserId },
    );
};
