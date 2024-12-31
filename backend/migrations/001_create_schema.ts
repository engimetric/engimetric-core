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

async function runMigrations() {
    const client = await pool.connect();

    try {
        console.log('🚀 Running migrations...');

        // ========================================
        // Phase 1: Create Base Tables
        // ========================================
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS teams (
                id SERIAL PRIMARY KEY,
                slug VARCHAR(255) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                owner_id INTEGER,
                is_frozen BOOLEAN DEFAULT FALSE,
                frozen_reason VARCHAR(255),
                is_demo BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS user_teams (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                team_id INTEGER NOT NULL,
                role VARCHAR(50) DEFAULT 'member',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                UNIQUE (user_id, team_id)
            );

            CREATE TABLE IF NOT EXISTS team_members (
                id SERIAL PRIMARY KEY,
                team_id INTEGER NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                user_id INTEGER,
                aliases TEXT[],
                metrics JSONB DEFAULT '{}'::JSONB,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS sync_states (
                team_id INTEGER NOT NULL,
                integration VARCHAR(255) NOT NULL,
                is_syncing BOOLEAN DEFAULT FALSE,
                last_started_at TIMESTAMP,
                last_heartbeat_at TIMESTAMP,
                last_synced_at TIMESTAMP,
                last_failed_at TIMESTAMP,
                PRIMARY KEY (team_id, integration)
            );

            CREATE TABLE IF NOT EXISTS settings (
                team_id INTEGER PRIMARY KEY,
                integrations JSONB DEFAULT '{}'::JSONB,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS subscriptions (
                id SERIAL PRIMARY KEY,
                team_id INTEGER NOT NULL,
                plan_type VARCHAR(50) NOT NULL,
                status VARCHAR(50) DEFAULT 'active',
                billing_cycle VARCHAR(50),
                start_date TIMESTAMP DEFAULT NOW(),
                end_date TIMESTAMP,
                metadata JSONB DEFAULT '{}'::JSONB,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                CONSTRAINT unique_subscription_team_id UNIQUE (team_id)
            );
        `);

        // ========================================
        // Phase 2: Add Foreign Key Constraints Safely
        // ========================================
        const constraints = [
            {
                table: 'teams',
                constraint: 'fk_teams_owner',
                query: `ALTER TABLE teams ADD CONSTRAINT fk_teams_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL;`,
            },
            {
                table: 'user_teams',
                constraint: 'fk_user_teams_user',
                query: `ALTER TABLE user_teams ADD CONSTRAINT fk_user_teams_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;`,
            },
            {
                table: 'user_teams',
                constraint: 'fk_user_teams_team',
                query: `ALTER TABLE user_teams ADD CONSTRAINT fk_user_teams_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;`,
            },
            {
                table: 'team_members',
                constraint: 'fk_team_members_team',
                query: `ALTER TABLE team_members ADD CONSTRAINT fk_team_members_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;`,
            },
            {
                table: 'team_members',
                constraint: 'fk_team_members_user',
                query: `ALTER TABLE team_members ADD CONSTRAINT fk_team_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;`,
            },
            {
                table: 'sync_states',
                constraint: 'fk_sync_states_team',
                query: `ALTER TABLE sync_states ADD CONSTRAINT fk_sync_states_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;`,
            },
            {
                table: 'settings',
                constraint: 'fk_settings_team',
                query: `ALTER TABLE settings ADD CONSTRAINT fk_settings_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;`,
            },
            {
                table: 'subscriptions',
                constraint: 'fk_subscriptions_team',
                query: `ALTER TABLE subscriptions ADD CONSTRAINT fk_subscriptions_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;`,
            },
        ];

        for (const { table, constraint, query } of constraints) {
            const exists = await client.query(
                `SELECT 1 FROM information_schema.table_constraints WHERE table_name = $1 AND constraint_name = $2;`,
                [table, constraint],
            );

            if (exists.rows.length === 0) {
                console.log(`🔗 Adding constraint ${constraint} to table ${table}`);
                await client.query(query);
            } else {
                console.log(`✅ Constraint ${constraint} already exists on table ${table}`);
            }
        }

        console.log('✅ Foreign key constraints added successfully!');

        // ========================================
        // Scheduler Role
        // ========================================
        const schedulerUser = process.env.SCHEDULER_DB_USER || 'scheduler_user';
        const schedulerPassword = process.env.SCHEDULER_DB_PASSWORD || 'secure_default_password';
        await client.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='${schedulerUser}') THEN
                    CREATE ROLE ${schedulerUser} WITH LOGIN PASSWORD '${schedulerPassword}';
                    GRANT CONNECT ON DATABASE ${process.env.DB_NAME} TO ${schedulerUser};
                    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${schedulerUser};
                    ALTER ROLE ${schedulerUser} BYPASSRLS;
                END IF;
            END $$;
        `);

        console.log('✅ Migrations completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        client.release();
    }
}

runMigrations().catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
});
