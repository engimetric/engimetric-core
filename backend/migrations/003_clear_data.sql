-- ========================================
-- Disable Foreign Key Constraints Temporarily
-- ========================================
SET session_replication_role = 'replica';

-- ========================================
-- Clear Data from Tables (in Reverse Dependency Order)
-- ========================================

-- Clear Sync States
TRUNCATE TABLE sync_states RESTART IDENTITY CASCADE;

-- Clear Settings
TRUNCATE TABLE settings RESTART IDENTITY CASCADE;

-- Clear Team Members
TRUNCATE TABLE team_members RESTART IDENTITY CASCADE;

-- Clear User Teams (Many-to-Many Relationship)
TRUNCATE TABLE user_teams RESTART IDENTITY CASCADE;

-- Clear Subscriptions
TRUNCATE TABLE subscriptions RESTART IDENTITY CASCADE;

-- Clear Teams
TRUNCATE TABLE teams RESTART IDENTITY CASCADE;

-- Clear Users
TRUNCATE TABLE users RESTART IDENTITY CASCADE;

-- ========================================
-- Re-enable Foreign Key Constraints
-- ========================================
SET session_replication_role = 'origin';

-- ========================================
-- Verify All Tables are Empty
-- ========================================
SELECT 
    'sync_states' AS table_name, COUNT(*) AS row_count FROM sync_states
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
