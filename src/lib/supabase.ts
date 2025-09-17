import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL 
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  role: 'organizer' | 'participant' | 'sponsor'
  skills?: string[]
  interests?: string[]
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  title: string
  description: string
  start_date: string
  end_date: string
  location: string
  location_type: 'physical' | 'virtual' | 'hybrid'
  category: string
  capacity: number
  image_url?: string
  organizer_id: string
  status: 'draft' | 'published' | 'completed'
  theme: string
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  name: string
  description: string
  event_id: string
  leader_id: string
  max_members: number
  skills_required: string[]
  created_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  joined_at: string
}

export interface EventRegistration {
  id: string
  event_id: string
  user_id: string
  registered_at: string
  status: 'registered' | 'checked_in' | 'cancelled'
}