import { Pool, PoolClient } from 'pg';
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

type TransactionOptions = {
    transactional?: boolean; // Controls if BEGIN/COMMIT/ROLLBACK is used
    requestingUserId?: number; // For RLS enforcement
};

/**
 * Run database operations with optional transaction and RLS context.
 *
 * @param handler - A function that executes database queries using the client.
 * @param options - Configuration for transaction and RLS enforcement.
 */
export const runWithTransaction = async <T>(
    handler: (client: PoolClient) => Promise<T>,
    options: TransactionOptions = { transactional: true },
): Promise<T> => {
    const client = await pool.connect();
    const { transactional = true, requestingUserId } = options;
    const startTime = Date.now();

    try {
        if (transactional) {
            await client.query('BEGIN');
        }

        // Only set RLS context if requestingUserId is defined and valid
        if (requestingUserId && requestingUserId > 0) {
            if (typeof requestingUserId !== 'number' || !Number.isInteger(requestingUserId)) {
                throw new Error('Invalid requestingUserId. Must be a valid integer.');
            }

            await client.query(`SET LOCAL app.current_user_id = ${Number(requestingUserId)};`);
            logger.debug(`✅ Set RLS Context: app.current_user_id = ${requestingUserId}`);
        } else {
            logger.debug('⚠️ Skipping RLS Context: No valid requestingUserId provided');
        }

        const result = await handler(client);

        if (transactional) {
            await client.query('COMMIT');
        }

        const duration = Date.now() - startTime;
        logger.info(`✅ Query executed successfully in ${duration}ms`);
        return result;
    } catch (error) {
        if (transactional) {
            await client.query('ROLLBACK');
        }
        const duration = Date.now() - startTime;
        logger.error(`❌ Query failed after ${duration}ms:`, error);
        throw error;
    } finally {
        client.release();
    }
};

// Create a dedicated pool for the scheduler user
const schedulerPool = new Pool({
    user: process.env.SCHEDULER_DB_USER,
    password: process.env.SCHEDULER_DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false,
    },
});

type SchedulerTransactionOptions = {
    transactional?: boolean; // Controls if BEGIN/COMMIT/ROLLBACK is used
};

/**
 * Run database operations using the scheduler role with optional transaction management.
 *
 * @param handler - A function that executes database queries using the client.
 * @param options - Configuration for transaction management.
 */
export const runWithSchedulerTransaction = async <T>(
    handler: (client: PoolClient) => Promise<T>,
    options: SchedulerTransactionOptions = { transactional: true },
): Promise<T> => {
    const client = await schedulerPool.connect();
    const { transactional = true } = options;
    const startTime = Date.now();

    try {
        if (transactional) {
            await client.query('BEGIN'); // Start transaction
        }

        const result = await handler(client); // Execute the handler

        if (transactional) {
            await client.query('COMMIT'); // Commit transaction
        }

        const duration = Date.now() - startTime;
        logger.info(`✅ Scheduler query executed successfully in ${duration}ms`);
        return result;
    } catch (error) {
        if (transactional) {
            await client.query('ROLLBACK'); // Rollback on error
        }
        const duration = Date.now() - startTime;
        logger.error(`❌ Scheduler query failed after ${duration}ms:`, error);
        throw error;
    } finally {
        client.release(); // Release the connection back to the pool
    }
};
