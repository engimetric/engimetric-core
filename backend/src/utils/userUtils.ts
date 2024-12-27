import { Pool } from 'pg';
import { User } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // Set to true if you have a valid SSL cert
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
    return result.rows;
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

    return result.rows[0];
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
export const createOrUpdateUser = async (user: {
    id?: number;
    email: string;
    password: string;
    admin?: boolean;
}) => {
    const query = `
        INSERT INTO users (id, email, password, admin, updated_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (id) DO UPDATE
        SET email = EXCLUDED.email,
            password = EXCLUDED.password,
            admin = EXCLUDED.admin,
            updated_at = NOW()
        RETURNING *;
    `;

    const values = [user.id || null, user.email, user.password, user.admin || false];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error creating/updating user:', error);
        throw error;
    }
};
