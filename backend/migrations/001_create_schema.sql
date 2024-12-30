-- ========================================
-- Phase 1: Create Base Tables
-- ========================================

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Teams Table
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,     -- URL-friendly identifier
    name VARCHAR(255) NOT NULL,            -- Display name of the team
    description TEXT,                      -- Optional team description
    owner_id INTEGER,                      -- References the owner user (can be NULL)
    is_frozen BOOLEAN DEFAULT FALSE,       -- Flag to lock the team from editing/syncing
    frozen_reason VARCHAR(255),            -- Reason why the team is frozen (nullable)
    is_demo BOOLEAN DEFAULT FALSE,         -- Specific flag for demo teams
    created_at TIMESTAMP DEFAULT NOW(),    -- Record creation timestamp
    updated_at TIMESTAMP DEFAULT NOW()     -- Last update timestamp
);

-- User Teams Table (Many-to-Many relationship between users and teams)
CREATE TABLE user_teams (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    role VARCHAR(50) DEFAULT 'member',     -- e.g., 'admin', 'member'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (user_id, team_id)
);

-- Team Members Table (Represents external users/integrations in a team)
CREATE TABLE team_members (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    user_id INTEGER, -- Nullable, for linking internal users
    aliases TEXT[],
    metrics JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Sync States Table
CREATE TABLE sync_states (
    team_id INTEGER NOT NULL,
    integration VARCHAR(255) NOT NULL,
    is_syncing BOOLEAN DEFAULT FALSE,
    last_started_at TIMESTAMP,
    last_heartbeat_at TIMESTAMP,
    last_synced_at TIMESTAMP,
    last_failed_at TIMESTAMP,
    PRIMARY KEY (team_id, integration)
);

-- Settings Table (1-to-1 with teams)
CREATE TABLE settings (
    team_id INTEGER PRIMARY KEY,           -- team_id is the PK, also unique
    integrations JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions Table (1-to-1 with teams)
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL,             -- references teams.id
    plan_type VARCHAR(50) NOT NULL,       -- e.g., 'free', 'hosted', 'enterprise'
    status VARCHAR(50) DEFAULT 'active',  -- e.g., 'active', 'canceled', 'expired'
    billing_cycle VARCHAR(50),            -- e.g., 'monthly', 'yearly'
    start_date TIMESTAMP DEFAULT NOW(),
    end_date TIMESTAMP,
    metadata JSONB DEFAULT '{}'::JSONB,   -- For additional plan-specific details
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Make team_id unique so there's at most one subscription per team:
    CONSTRAINT unique_subscription_team_id UNIQUE (team_id)
);

-- ========================================
-- Phase 2: Add Foreign Key Constraints
-- ========================================

-- Teams Table
ALTER TABLE teams
ADD CONSTRAINT fk_teams_owner
FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL;

-- User Teams Table
ALTER TABLE user_teams
ADD CONSTRAINT fk_user_teams_user
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_teams
ADD CONSTRAINT fk_user_teams_team
FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;

-- Team Members Table
ALTER TABLE team_members
ADD CONSTRAINT fk_team_members_team
FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;

ALTER TABLE team_members
ADD CONSTRAINT fk_team_members_user
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Sync States Table
ALTER TABLE sync_states
ADD CONSTRAINT fk_sync_states_team
FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;

-- Settings Table
ALTER TABLE settings
ADD CONSTRAINT fk_settings_team
FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;

-- Subscriptions Table
ALTER TABLE subscriptions
ADD CONSTRAINT fk_subscriptions_team
FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;

-- ========================================
-- Phase 3: Indices and Constraints
-- ========================================

-- Index for faster queries
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_user_teams_user_id ON user_teams (user_id);
CREATE INDEX idx_user_teams_team_id ON user_teams (team_id);
CREATE INDEX idx_team_members_team_id ON team_members (team_id);
CREATE INDEX idx_sync_states_team_id ON sync_states (team_id);
CREATE INDEX idx_settings_team_id ON settings (team_id);

-- Ensure unique email for team_members if provided
CREATE UNIQUE INDEX idx_team_members_email ON team_members (email) WHERE email IS NOT NULL;

-- Ensure unique integration per team in sync_states (already done via PRIMARY KEY, but okay as an index)
CREATE UNIQUE INDEX idx_sync_states_integration ON sync_states (team_id, integration);

-- Ensure unique user per team in user_teams (already done via UNIQUE (user_id, team_id))
CREATE UNIQUE INDEX idx_user_teams_unique ON user_teams (user_id, team_id);

-- Index on plan_type for faster queries by plan type
CREATE INDEX idx_subscriptions_plan_type ON subscriptions (plan_type);

-- Index on team_id for easier lookups
CREATE INDEX idx_subscriptions_team_id ON subscriptions (team_id);
