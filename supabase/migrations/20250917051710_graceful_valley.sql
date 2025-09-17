/*
  # Create storage buckets for file uploads

  1. Storage Buckets
    - `avatars` - for user profile pictures
    - `event-images` - for event cover images
    - `team-files` - for team file sharing

  2. Security
    - Set up RLS policies for each bucket
    - Allow authenticated users to upload/download files
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('avatars', 'avatars', true),
  ('event-images', 'event-images', true),
  ('team-files', 'team-files', false)
ON CONFLICT (id) DO NOTHING;

-- Policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policies for event-images bucket
CREATE POLICY "Event images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-images');

CREATE POLICY "Authenticated users can upload event images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'event-images');

CREATE POLICY "Authenticated users can delete event images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'event-images');

-- Policies for team-files bucket
CREATE POLICY "Team members can access team files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'team-files'
    AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = auth.uid()
      AND team_members.team_id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Team members can upload files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'team-files'
    AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = auth.uid()
      AND team_members.team_id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Team members can delete files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'team-files'
    AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.user_id = auth.uid()
      AND team_members.team_id::text = (storage.foldername(name))[1]
    )
  );