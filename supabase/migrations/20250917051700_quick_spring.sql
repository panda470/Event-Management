/*
  # Create event registrations table

  1. New Tables
    - `event_registrations`
      - `id` (uuid, primary key)
      - `event_id` (uuid, references events)
      - `user_id` (uuid, references profiles)
      - `registered_at` (timestamptz)
      - `status` (enum: registered, checked_in, cancelled)

  2. Security
    - Enable RLS on `event_registrations` table
    - Add policies for registration management
*/

-- Create enum for registration status
CREATE TYPE registration_status AS ENUM ('registered', 'checked_in', 'cancelled');

-- Create event registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  registered_at timestamptz DEFAULT now(),
  status registration_status NOT NULL DEFAULT 'registered',
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own registrations"
  ON event_registrations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Event organizers can view registrations for their events"
  ON event_registrations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_registrations.event_id 
      AND events.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Users can register for events"
  ON event_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own registrations"
  ON event_registrations
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Event organizers can update registrations for their events"
  ON event_registrations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_registrations.event_id 
      AND events.organizer_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS event_registrations_event_id_idx ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS event_registrations_user_id_idx ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS event_registrations_status_idx ON event_registrations(status);