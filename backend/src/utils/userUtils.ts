import logger from './logger';
import { User } from '../models/User';
import { runWithTransaction, runWithSchedulerTransaction } from './databaseUtils';

/**
 * Fetch all users.
 *
 * @returns Promise that resolves with an array of all users from the database
 * @throws Error if the users could not be fetched
 */
export const fetchAllUsers = async (): Promise<User[]> => {
    return runWithSchedulerTransaction(
        async (client) => {
            const result = await client.query('SELECT * FROM users');
            return result.rows.map((user) => ({
                id: user.id,
                email: user.email,
                password: user.password,
                createdAt: user.created_at,
                updatedAt: user.updated_at,
            }));
        },
        { transactional: false },
    );
};

/**
 * Fetch a single user by their ID.
 *
 * @param userId - The ID of the user to fetch
 * @returns The user object or undefined if not found
 * @throws Error if the user could not be fetched
 */
export const fetchUserById = async (userId: number, requestingUserId: number): Promise<User | undefined> => {
    return runWithTransaction(
        async (client) => {
            const result = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
            if (result.rows.length === 0) return undefined;

            const user = result.rows[0];
            return {
                id: user.id,
                email: user.email,
                password: user.password,
                createdAt: user.created_at,
                updatedAt: user.updated_at,
            };
        },
        { transactional: false, requestingUserId },
    );
};

/**
 * Delete a user by their ID.
 *
 * @param userId - The ID of the user to delete
 * @throws Error if the user could not be deleted
 * @returns Promise that resolves when the user is deleted
 */
export const deleteUser = async (userId: number, requestingUserId: number): Promise<void> => {
    return runWithTransaction(
        async (client) => {
            await client.query('DELETE FROM users WHERE id = $1', [userId]);
        },
        { transactional: false, requestingUserId },
    );
};

/**
 * Create or update a user.
 *
 * @param user - User object with necessary fields.
 * @param requestingUserId - Optional user ID (only used for updates, not for registration)
 */
export const createOrUpdateUser = async (
    user: { email: string; password: string; admin?: boolean },
    requestingUserId?: number, // Optional for registration
) => {
    const query = `
      INSERT INTO users (email, password, admin, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE
        SET 
          password = EXCLUDED.password,
          admin = EXCLUDED.admin,
          updated_at = NOW()
      RETURNING *;
    `;

    const values = [user.email, user.password, user.admin ?? false];

    return runWithTransaction(
        async (client) => {
            const result = await client.query(query, values);
            const user = result.rows[0];
            return {
                id: user.id,
                email: user.email,
                password: user.password,
                createdAt: user.created_at,
                updatedAt: user.updated_at,
            };
        },
        {
            transactional: false,
            requestingUserId: requestingUserId ?? undefined, // Avoid RLS if no userId is provided
        },
    );
};
