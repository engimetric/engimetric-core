-- ========================================
-- Insert Demo Users
-- ========================================
INSERT INTO users (email, password, admin, created_at, updated_at) VALUES
('admin@engimetric.com', '$2b$10$G.pKbYghivMx/aTtU380wOzY3nWWO5pl.J2QJkZudYTbJ1f//F09O', TRUE, NOW(), NOW()),
('demo_user@engimetric.com', '$2b$10$5RTiY09klAG/l0VbuF.JxOSWT/y2zHmqkW8GKywmZbrV75nAmA1oK', FALSE, NOW(), NOW());

-- admin@engimetric.com password: admin123
-- demo_user@engimetric.com password: demo123

-- ========================================
-- Insert Demo Teams
-- ========================================
INSERT INTO teams (slug, name, description, owner_id, is_frozen, frozen_reason, is_demo, created_at, updated_at) VALUES
('engimetric-demo', 'Engimetric Demo Team', 'This is a read-only demo team.', 1, TRUE, 'Demo Mode - Read-only Access', TRUE, NOW(), NOW()),
('engimetric-qa', 'Engimetric QA Team', 'Team for QA and testing.', 2, FALSE, NULL, FALSE, NOW(), NOW());

-- ========================================
-- Insert Demo Subscriptions
-- ========================================
INSERT INTO subscriptions (team_id, plan_type, status, billing_cycle, start_date, end_date, metadata, created_at, updated_at) VALUES
(1, 'free', 'active', NULL, NOW(), NULL, '{"feature_flags": ["read_only_mode"]}', NOW(), NOW()),
(2, 'hosted', 'active', 'yearly', NOW(), NOW() + INTERVAL '1 year', '{"feature_flags": ["advanced_reporting"]}', NOW(), NOW());

-- Update Teams with Subscription Reference
UPDATE teams SET subscription_id = 1 WHERE id = 1;
UPDATE teams SET subscription_id = 2 WHERE id = 2;

-- ========================================
-- Insert Demo User Teams (Associations)
-- ========================================
-- Admin for Demo Team
INSERT INTO user_teams (user_id, team_id, role, created_at, updated_at) VALUES
(1, 1, 'admin', NOW(), NOW());

-- Admin for QA Team
INSERT INTO user_teams (user_id, team_id, role, created_at, updated_at) VALUES
(2, 2, 'admin', NOW(), NOW());

-- Admin User as Member in the QA Team
INSERT INTO user_teams (user_id, team_id, role, created_at, updated_at) VALUES
(1, 2, 'member', NOW(), NOW());

-- ========================================
-- Insert Demo Team Members (External Users/Integrations)
-- ========================================

-- Generate 20 team members for Demo Team with 12 Months of GitHub & Jira Data
DO $$
DECLARE
    i INTEGER;
    month_offset INTEGER;
    current_month DATE;
    metrics_json JSONB;
BEGIN
  FOR i IN 1..20 LOOP
    -- Build Metrics JSON for 13 Months
    metrics_json := '{}'::JSONB;

    FOR month_offset IN 0..12 LOOP
        current_month := DATE_TRUNC('month', NOW()) - INTERVAL '1 month' * month_offset;
        metrics_json := jsonb_set(
            metrics_json,
            ARRAY[TO_CHAR(current_month, 'YYYY-MM')],
            jsonb_build_object(
                'GitHub', jsonb_build_object(
                    'merges', FLOOR(RANDOM() * 20 + 5)::INTEGER,
                    'reviews', FLOOR(RANDOM() * 10 + 2)::INTEGER
                ),
                'Jira', jsonb_build_object(
                    'stories', FLOOR(RANDOM() * 30 + 10)::INTEGER,
                    'epics', FLOOR(RANDOM() * 15 + 5)::INTEGER,
                    'bugs', FLOOR(RANDOM() * 25 + 5)::INTEGER
                )
            )
        );
    END LOOP;

    -- Insert Demo Team Member with Metrics
    INSERT INTO team_members (team_id, full_name, email, user_id, aliases, metrics, created_at, updated_at) 
    VALUES (
      1,
      'Demo Member ' || i,
      'demo' || i || '@engimetric.com',
      NULL,
      ARRAY['demo_member_' || i],
      metrics_json,
      NOW(),
      NOW()
    );
  END LOOP;
END $$;

-- Generate 20 team members for QA Team with 12 Months of Jira Data
DO $$
DECLARE
    i INTEGER;
    month_offset INTEGER;
    current_month DATE;
    metrics_json JSONB;
BEGIN
  FOR i IN 1..20 LOOP
    -- Build Metrics JSON for 13 Months
    metrics_json := '{}'::JSONB;

    FOR month_offset IN 0..12 LOOP
        current_month := DATE_TRUNC('month', NOW()) - INTERVAL '1 month' * month_offset;
        metrics_json := jsonb_set(
            metrics_json,
            ARRAY[TO_CHAR(current_month, 'YYYY-MM')],
            jsonb_build_object(
                'Jira', jsonb_build_object(
                    'stories', FLOOR(RANDOM() * 30 + 10)::INTEGER,
                    'epics', FLOOR(RANDOM() * 15 + 5)::INTEGER,
                    'bugs', FLOOR(RANDOM() * 25 + 5)::INTEGER
                )
            )
        );
    END LOOP;

    -- Insert QA Team Member with Metrics
    INSERT INTO team_members (team_id, full_name, email, user_id, aliases, metrics, created_at, updated_at) 
    VALUES (
      2,
      'QA Member ' || i,
      'qa' || i || '@engimetric.com',
      NULL,
      ARRAY['qa_member_' || i],
      metrics_json,
      NOW(),
      NOW()
    );
  END LOOP;
END $$;

-- ========================================
-- Insert Demo Sync States
-- ========================================
INSERT INTO sync_states (team_id, integration, is_syncing, last_started_at, last_heartbeat_at, last_synced_at, last_failed_at) VALUES
(1, 'GitHub', FALSE, NOW() - INTERVAL '1 day', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '1 hour', NULL),
(2, 'Jira', TRUE, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '15 minutes', NULL, NOW() - INTERVAL '10 minutes');

-- ========================================
-- Insert Demo Settings
-- ========================================
INSERT INTO settings (team_id, integrations, created_at, updated_at) VALUES
(1, '{"GitHub": {"enabled": false, "token": "demo_readonly", "org": "engimetric"}, "Jira": {"enabled": true, "token": "demo_readonly"}}', NOW(), NOW()),
(2, '{"GitHub": {"enabled": false, "token": "demo_readonly", "org": "engimetric"}, "Jira": {"enabled": true, "token": "demo_readonly"}}', NOW(), NOW());
