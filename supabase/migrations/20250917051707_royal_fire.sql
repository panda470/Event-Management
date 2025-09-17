/*
  # Create event favorites table

  1. New Tables
    - `event_favorites`
      - `id` (uuid, primary key)
      - `event_id` (uuid, references events)
      - `user_id` (uuid, references profiles)
      - `favorited_at` (timestamptz)

  2. Security
    - Enable RLS on `event_favorites` table
    - Add policies for favorite management
*/

-- Create event favorites table
CREATE TABLE IF NOT EXISTS event_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  favorited_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE event_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own favorites"
  ON event_favorites
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can add events to favorites"
  ON event_favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove events from favorites"
  ON event_favorites
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS event_favorites_event_id_idx ON event_favorites(event_id);
CREATE INDEX IF NOT EXISTS event_favorites_user_id_idx ON event_favorites(user_id);