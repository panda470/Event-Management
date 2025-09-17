/*
  # Fix profile creation trigger

  1. Changes
    - Update handle_new_user function to properly extract full_name and role from user metadata
    - Ensure the trigger creates profiles with the correct data from sign-up

  2. Security
    - No changes to existing RLS policies
*/

-- Update function to handle user creation with metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'participant'::user_role)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;