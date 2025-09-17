/*
  # Create teams and team members tables

  1. New Tables
    - `teams`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `event_id` (uuid, references events)
      - `leader_id` (uuid, references profiles)
      - `max_members` (integer)
      - `skills_required` (text array)
      - `created_at` (timestamptz)
    - `team_members`
      - `id` (uuid, primary key)
      - `team_id` (uuid, references teams)
      - `user_id` (uuid, references profiles)
      - `joined_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add appropriate policies for team management
*/

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  leader_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  max_members integer NOT NULL DEFAULT 4,
  skills_required text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create team members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Policies for teams
CREATE POLICY "Teams are viewable by authenticated users"
  ON teams
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Team leaders can manage their teams"
  ON teams
  FOR ALL
  TO authenticated
  USING (leader_id = auth.uid());

CREATE POLICY "Authenticated users can create teams"
  ON teams
  FOR INSERT
  TO authenticated
  WITH CHECK (leader_id = auth.uid());

-- Policies for team members
CREATE POLICY "Team members are viewable by authenticated users"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join teams"
  ON team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave teams"
  ON team_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Team leaders can manage members"
  ON team_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = team_members.team_id 
      AND teams.leader_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS teams_event_id_idx ON teams(event_id);
CREATE INDEX IF NOT EXISTS teams_leader_id_idx ON teams(leader_id);
CREATE INDEX IF NOT EXISTS team_members_team_id_idx ON team_members(team_id);
CREATE INDEX IF NOT EXISTS team_members_user_id_idx ON team_members(user_id);