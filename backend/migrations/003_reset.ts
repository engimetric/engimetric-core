import dotenv from 'dotenv';
import { Pool } from 'pg';

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

async function resetDatabase() {
    const client = await pool.connect();

    try {
        console.log('🚀 Resetting database...');

        const tables = [
            'sync_states',
            'settings',
            'team_members',
            'user_teams',
            'subscriptions',
            'teams',
            'users',
        ];

        // ========================================
        // Clear Data from Tables (in Reverse Dependency Order)
        // ========================================
        console.log('⏳ Deleting data from tables in reverse dependency order...');
        for (const table of tables) {
            console.log(`🔄 Deleting data from table: ${table}`);
            await client.query(`DELETE FROM ${table};`);
        }

        console.log('✅ All tables cleared.');

        // ========================================
        // Reset Sequence Counters (Auto-increment fields)
        // ========================================
        console.log('⏳ Resetting sequence counters...');
        for (const table of tables) {
            console.log(`🔄 Resetting sequence for table: ${table}`);
            await client.query(`
                DO $$ 
                DECLARE
                    seq RECORD;
                BEGIN
                    FOR seq IN SELECT c.oid::regclass AS seqname
                    FROM pg_class c
                    JOIN pg_namespace n ON n.oid = c.relnamespace
                    WHERE c.relkind = 'S' AND c.relname LIKE '${table}_%'
                    LOOP
                        EXECUTE format('ALTER SEQUENCE %I RESTART WITH 1', seq.seqname);
                    END LOOP;
                END $$;
            `);
        }

        console.log('✅ Sequence counters reset.');

        // ========================================
        // Verify All Tables are Empty
        // ========================================
        console.log('⏳ Verifying that all tables are empty...');
        const result = await client.query(`
            SELECT 'sync_states' AS table_name, COUNT(*) AS row_count FROM sync_states
            UNION ALL
            SELECT 'settings', COUNT(*) FROM settings
            UNION ALL
            SELECT 'team_members', COUNT(*) FROM team_members
            UNION ALL
            SELECT 'user_teams', COUNT(*) FROM user_teams
            UNION ALL
            SELECT 'subscriptions', COUNT(*) FROM subscriptions
            UNION ALL
            SELECT 'teams', COUNT(*) FROM teams
            UNION ALL
            SELECT 'users', COUNT(*) FROM users;
        `);

        console.table(result.rows);

        console.log('🎉 Database reset successfully completed!');
    } catch (error) {
        console.error('❌ Database reset failed:', error);
    } finally {
        client.release();
    }
}

// Run the reset script
resetDatabase().catch((error) => {
    console.error('❌ Reset script failed:', error);
    process.exit(1);
});
