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

async function seedDatabase() {
    const client = await pool.connect();

    try {
        console.log('🚀 Seeding database with demo data...');

        // ========================================
        // Insert Demo Users
        // ========================================
        await client.query(`
            INSERT INTO users (email, password, created_at, updated_at) VALUES
            ('admin@engimetric.com', '$2b$10$G.pKbYghivMx/aTtU380wOzY3nWWO5pl.J2QJkZudYTbJ1f//F09O', NOW(), NOW()),
            ('demo_user@engimetric.com', '$2b$10$5RTiY09klAG/l0VbuF.JxOSWT/y2zHmqkW8GKywmZbrV75nAmA1oK', NOW(), NOW());
        `);
        console.log('✅ Demo users inserted.');

        // ========================================
        // Insert Demo Teams
        // ========================================
        await client.query(`
            INSERT INTO teams (slug, name, description, owner_id, is_frozen, frozen_reason, is_demo, created_at, updated_at) VALUES
            ('engimetric-demo', 'Engimetric Demo Team', 'This is a read-only demo team.', 1, TRUE, 'Demo Mode - Read-only Access', TRUE, NOW(), NOW()),
            ('engimetric-qa', 'Engimetric QA Team', 'Team for QA and testing.', 2, FALSE, NULL, FALSE, NOW(), NOW());
        `);
        console.log('✅ Demo teams inserted.');

        // ========================================
        // Insert Demo Subscriptions
        // ========================================
        await client.query(`
            INSERT INTO subscriptions (team_id, plan_type, status, billing_cycle, start_date, end_date, metadata, created_at, updated_at) VALUES
            (1, 'free', 'active', NULL, NOW(), NULL, '{"feature_flags": ["read_only_mode"]}', NOW(), NOW()),
            (2, 'hosted', 'active', 'yearly', NOW(), NOW() + INTERVAL '1 year', '{"feature_flags": ["advanced_reporting"]}', NOW(), NOW());
        `);

        await client.query(`
            UPDATE teams SET subscription_id = 1 WHERE id = 1;
            UPDATE teams SET subscription_id = 2 WHERE id = 2;
        `);
        console.log('✅ Demo subscriptions inserted and linked.');

        // ========================================
        // Insert Demo User Teams (Associations)
        // ========================================
        await client.query(`
            INSERT INTO user_teams (user_id, team_id, role, created_at, updated_at) VALUES
            (1, 1, 'admin', NOW(), NOW()),
            (2, 2, 'admin', NOW(), NOW()),
            (1, 2, 'member', NOW(), NOW());
        `);
        console.log('✅ Demo user-team associations inserted.');

        // ========================================
        // Insert Demo Team Members (External Users/Integrations)
        // ========================================
        console.log('⏳ Inserting demo team members with metrics...');
        for (let i = 1; i <= 20; i++) {
            let metrics: Record<string, any> = {};

            for (let month_offset = 0; month_offset <= 12; month_offset++) {
                const current_month = new Date();
                current_month.setMonth(current_month.getMonth() - month_offset);

                const monthKey = `${current_month.getFullYear()}-${String(current_month.getMonth() + 1).padStart(2, '0')}`;
                metrics[monthKey] = {
                    GitHub: {
                        merges: Math.floor(Math.random() * 20 + 5),
                        reviews: Math.floor(Math.random() * 10 + 2),
                    },
                    Jira: {
                        stories: Math.floor(Math.random() * 30 + 10),
                        epics: Math.floor(Math.random() * 15 + 5),
                        bugs: Math.floor(Math.random() * 25 + 5),
                    },
                };
            }

            await client.query(
                `
                INSERT INTO team_members (team_id, full_name, email, user_id, aliases, metrics, created_at, updated_at) 
                VALUES ($1, $2, $3, NULL, $4, $5, NOW(), NOW());
                `,
                [1, `Demo Member ${i}`, `demo${i}@engimetric.com`, [`demo_member_${i}`], metrics],
            );
        }
        console.log('✅ Demo team members (Demo Team) inserted.');

        for (let i = 1; i <= 20; i++) {
            let metrics: Record<string, any> = {};

            for (let month_offset = 0; month_offset <= 12; month_offset++) {
                const current_month = new Date();
                current_month.setMonth(current_month.getMonth() - month_offset);

                const monthKey = `${current_month.getFullYear()}-${String(current_month.getMonth() + 1).padStart(2, '0')}`;
                metrics[monthKey] = {
                    Jira: {
                        stories: Math.floor(Math.random() * 30 + 10),
                        epics: Math.floor(Math.random() * 15 + 5),
                        bugs: Math.floor(Math.random() * 25 + 5),
                    },
                };
            }

            await client.query(
                `
                INSERT INTO team_members (team_id, full_name, email, user_id, aliases, metrics, created_at, updated_at) 
                VALUES ($1, $2, $3, NULL, $4, $5, NOW(), NOW());
                `,
                [2, `QA Member ${i}`, `qa${i}@engimetric.com`, [`qa_member_${i}`], metrics],
            );
        }
        console.log('✅ Demo team members (QA Team) inserted.');

        // ========================================
        // Insert Demo Sync States
        // ========================================
        await client.query(`
            INSERT INTO sync_states (team_id, integration, is_syncing, last_started_at, last_heartbeat_at, last_synced_at, last_failed_at) VALUES
            (1, 'GitHub', FALSE, NOW() - INTERVAL '1 day', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '1 hour', NULL),
            (2, 'Jira', TRUE, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '15 minutes', NULL, NOW() - INTERVAL '10 minutes');
        `);
        console.log('✅ Demo sync states inserted.');

        // ========================================
        // Insert Demo Settings
        // ========================================
        await client.query(`
            INSERT INTO settings (team_id, integrations, created_at, updated_at) VALUES
            (1, '{"GitHub": {"enabled": false}, "Jira": {"enabled": true}}', NOW(), NOW()),
            (2, '{"GitHub": {"enabled": false}, "Jira": {"enabled": true}}', NOW(), NOW());
        `);
        console.log('✅ Demo settings inserted.');

        console.log('🎉 Database seeding completed successfully!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        client.release();
    }
}

seedDatabase().catch((error) => {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
});
