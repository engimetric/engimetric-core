import { Pool } from 'pg';
import { User } from '../models/User';
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
 * Fetch all users.
 *
 * @returns Promise that resolves with an array of all users from the database
 * @throws Error if the users could not be fetched
 */
export const fetchAllUsers = async (): Promise<User[]> => {
    const result = await pool.query('SELECT * FROM users');
    return result.rows.map((user) => ({
        id: user.id,
        email: user.email,
        password: user.password,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
    }));
};

/**
 * Fetch a single user by their ID.
 *
 * @param userId - The ID of the user to fetch
 * @returns The user object or undefined if not found
 * @throws Error if the user could not be fetched
 */
export const fetchUserById = async (userId: number): Promise<User | undefined> => {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) return undefined;

    const user = result.rows[0];
    return {
        id: user.id,
        email: user.email,
        password: user.password,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
    };
};

/**
 * Delete a user by their ID.
 *
 * @param userId - The ID of the user to delete
 * @throws Error if the user could not be deleted
 * @returns Promise that resolves when the user is deleted
 */
export const deleteUser = async (userId: number): Promise<void> => {
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
};

/**
 * Create or update a user.
 * @param user - User object with necessary fields.
 */

export const createOrUpdateUser = async (user: { email: string; password: string; admin?: boolean }) => {
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

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        logger.error('Error creating/updating user:', error);
        throw error;
    }
};
