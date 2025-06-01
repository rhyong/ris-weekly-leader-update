-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication and user management
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Teams table to store team information
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Organizations table to store client organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Team members table to track team membership
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    role VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, team_id)
);

-- Weekly updates table - main table for weekly reports
CREATE TABLE weekly_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    week_date DATE NOT NULL,
    top_3_bullets TEXT,
    status VARCHAR(20) DEFAULT 'draft', -- draft, published, archived
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, week_date)
);

-- Team health table
CREATE TABLE team_health (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    update_id UUID NOT NULL REFERENCES weekly_updates(id) ON DELETE CASCADE,
    owner_input TEXT,
    sentiment_score DECIMAL(3,1),
    overall_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Delivery performance table
CREATE TABLE delivery_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    update_id UUID NOT NULL REFERENCES weekly_updates(id) ON DELETE CASCADE,
    workload_balance VARCHAR(10) CHECK (workload_balance IN ('TooMuch', 'TooLittle', 'JustRight')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Delivery accomplishments table
CREATE TABLE delivery_accomplishments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    performance_id UUID NOT NULL REFERENCES delivery_performance(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Delivery misses and delays table
CREATE TABLE delivery_misses_delays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    performance_id UUID NOT NULL REFERENCES delivery_performance(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Stakeholder engagement table
CREATE TABLE stakeholder_engagement (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    update_id UUID NOT NULL REFERENCES weekly_updates(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Stakeholder feedback notes table
CREATE TABLE stakeholder_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    engagement_id UUID NOT NULL REFERENCES stakeholder_engagement(id) ON DELETE CASCADE,
    feedback TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- Risks and escalations table
CREATE TABLE risks_escalations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    update_id UUID NOT NULL REFERENCES weekly_updates(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Risks table
CREATE TABLE risks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    risks_escalations_id UUID NOT NULL REFERENCES risks_escalations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(10) CHECK (severity IN ('Green', 'Yellow', 'Red')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Escalations table
CREATE TABLE escalations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    risks_escalations_id UUID NOT NULL REFERENCES risks_escalations(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Opportunities and wins table
CREATE TABLE opportunities_wins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    update_id UUID NOT NULL REFERENCES weekly_updates(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Wins table
CREATE TABLE wins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunities_wins_id UUID NOT NULL REFERENCES opportunities_wins(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Growth opportunities table
CREATE TABLE growth_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunities_wins_id UUID NOT NULL REFERENCES opportunities_wins(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Support needed table
CREATE TABLE support_needed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    update_id UUID NOT NULL REFERENCES weekly_updates(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Support requests table
CREATE TABLE support_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    support_needed_id UUID NOT NULL REFERENCES support_needed(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Personal updates table
CREATE TABLE personal_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    update_id UUID NOT NULL REFERENCES weekly_updates(id) ON DELETE CASCADE,
    support_needed TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Personal wins table
CREATE TABLE personal_wins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    personal_update_id UUID NOT NULL REFERENCES personal_updates(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Personal reflections table
CREATE TABLE personal_reflections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    personal_update_id UUID NOT NULL REFERENCES personal_updates(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Personal goals table
CREATE TABLE personal_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    personal_update_id UUID NOT NULL REFERENCES personal_updates(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    status VARCHAR(10) CHECK (status IN ('Green', 'Yellow', 'Red')),
    update_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Team members updates table
CREATE TABLE team_members_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    update_id UUID NOT NULL REFERENCES weekly_updates(id) ON DELETE CASCADE,
    people_changes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Top contributors table
CREATE TABLE top_contributors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_members_update_id UUID NOT NULL REFERENCES team_members_updates(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    achievement TEXT NOT NULL,
    recognition TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Members needing attention table
CREATE TABLE members_needing_attention (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_members_update_id UUID NOT NULL REFERENCES team_members_updates(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    issue TEXT NOT NULL,
    support_plan TEXT,
    delivery_risk VARCHAR(10) CHECK (delivery_risk IN ('Low', 'Medium', 'High')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table for authentication
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_weekly_updates_user_id ON weekly_updates(user_id);
CREATE INDEX idx_weekly_updates_team_id ON weekly_updates(team_id);
CREATE INDEX idx_weekly_updates_week_date ON weekly_updates(week_date);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- Create trigger function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables to update the updated_at timestamp
CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_teams_timestamp BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_organizations_timestamp BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_team_members_timestamp BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_weekly_updates_timestamp BEFORE UPDATE ON weekly_updates FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_team_health_timestamp BEFORE UPDATE ON team_health FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_delivery_performance_timestamp BEFORE UPDATE ON delivery_performance FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_delivery_accomplishments_timestamp BEFORE UPDATE ON delivery_accomplishments FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_delivery_misses_delays_timestamp BEFORE UPDATE ON delivery_misses_delays FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_stakeholder_engagement_timestamp BEFORE UPDATE ON stakeholder_engagement FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_stakeholder_feedback_timestamp BEFORE UPDATE ON stakeholder_feedback FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_risks_escalations_timestamp BEFORE UPDATE ON risks_escalations FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_risks_timestamp BEFORE UPDATE ON risks FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_escalations_timestamp BEFORE UPDATE ON escalations FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_opportunities_wins_timestamp BEFORE UPDATE ON opportunities_wins FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_wins_timestamp BEFORE UPDATE ON wins FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_growth_opportunities_timestamp BEFORE UPDATE ON growth_opportunities FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_support_needed_timestamp BEFORE UPDATE ON support_needed FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_support_requests_timestamp BEFORE UPDATE ON support_requests FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_personal_updates_timestamp BEFORE UPDATE ON personal_updates FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_personal_wins_timestamp BEFORE UPDATE ON personal_wins FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_personal_reflections_timestamp BEFORE UPDATE ON personal_reflections FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_personal_goals_timestamp BEFORE UPDATE ON personal_goals FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_team_members_updates_timestamp BEFORE UPDATE ON team_members_updates FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_top_contributors_timestamp BEFORE UPDATE ON top_contributors FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_members_needing_attention_timestamp BEFORE UPDATE ON members_needing_attention FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Create a function to hash passwords in the same way as the app (SHA-256)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(digest(password, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Insert some initial data for testing
INSERT INTO users (username, password_hash, name, role) VALUES 
('admin', hash_password('password123'), 'Admin User', 'admin'),
('testuser', hash_password('password123'), 'Test User', 'team_lead');

INSERT INTO teams (name, description) VALUES 
('Enigma', 'Mirdul Oli''s team'),
('Nova', 'Shane Lessard''s team'),
('Team Cruz', 'Anne Cruz''s team'),
('Team Singh', 'Manjit Singh''s team'),
('Team Stranianek', 'Marta Stranianek''s team'),
('Titan', 'Aady Sridhar''s team'),
('Zenith', 'Greg Presland''s team'),
('Software Development Team', 'Software development team');

INSERT INTO organizations (name, description) VALUES 
('Rocket - CX - RMA', 'Rocket - CX - RMA'),
('Rocket - CX - RMS', 'Rocket - CX - RMS'),
('Rocket Close', 'Rocket Close'),
('Rocket Pro', 'Rocket Pro'),
('Rocket - CX', 'Rocket - CX'),
('RIS', 'RIS');