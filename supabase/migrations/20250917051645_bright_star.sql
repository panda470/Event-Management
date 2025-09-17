/*
  # Create events table

  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `start_date` (timestamptz)
      - `end_date` (timestamptz)
      - `location` (text)
      - `location_type` (enum: physical, virtual, hybrid)
      - `category` (text)
      - `capacity` (integer)
      - `image_url` (text, optional)
      - `organizer_id` (uuid, references profiles)
      - `status` (enum: draft, published, completed)
      - `theme` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `events` table
    - Add policy for organizers to manage their events
    - Add policy for authenticated users to read published events
*/

-- Create enums
CREATE TYPE location_type AS ENUM ('physical', 'virtual', 'hybrid');
CREATE TYPE event_status AS ENUM ('draft', 'published', 'completed');

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  location text NOT NULL,
  location_type location_type NOT NULL DEFAULT 'physical',
  category text NOT NULL,
  capacity integer NOT NULL DEFAULT 50,
  image_url text,
  organizer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status event_status NOT NULL DEFAULT 'draft',
  theme text NOT NULL DEFAULT 'modern',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Organizers can manage their events"
  ON events
  FOR ALL
  TO authenticated
  USING (organizer_id = auth.uid());

CREATE POLICY "Published events are viewable by authenticated users"
  ON events
  FOR SELECT
  TO authenticated
  USING (status = 'published');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS events_organizer_id_idx ON events(organizer_id);
CREATE INDEX IF NOT EXISTS events_start_date_idx ON events(start_date);
CREATE INDEX IF NOT EXISTS events_status_idx ON events(status);
CREATE INDEX IF NOT EXISTS events_category_idx ON events(category);