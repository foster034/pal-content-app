import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Legacy client for backwards compatibility (use sparingly)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side admin client with service role key
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Re-export the specialized clients
export { createClientComponentClient } from './supabase-client'
export { createServerComponentClient } from './supabase-server'

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'franchisee' | 'tech'
          franchisee_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'franchisee' | 'tech'
          franchisee_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'franchisee' | 'tech'
          franchisee_id?: string | null
          updated_at?: string
        }
      }
      franchisees: {
        Row: {
          id: string
          business_name: string
          username: string | null
          phone: string
          email: string
          website: string | null
          google_review_url: string | null
          territory: string | null
          country: string
          status: string
          image: string | null
          owners: any[]
          notification_preferences: any
          owner_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_name: string
          username?: string | null
          phone: string
          email: string
          website?: string | null
          google_review_url?: string | null
          territory?: string | null
          country?: string
          status?: string
          image?: string | null
          owners?: any[]
          notification_preferences?: any
          owner_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_name?: string
          username?: string | null
          phone?: string
          email?: string
          website?: string | null
          google_review_url?: string | null
          territory?: string | null
          country?: string
          status?: string
          image?: string | null
          owners?: any[]
          notification_preferences?: any
          owner_id?: string | null
          updated_at?: string
        }
      }
      technicians: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          image_url: string | null
          rating: number
          role: string
          franchisee_id: string
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          image_url?: string | null
          rating?: number
          role?: string
          franchisee_id: string
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          image_url?: string | null
          rating?: number
          role?: string
          franchisee_id?: string
          user_id?: string | null
          updated_at?: string
        }
      }
      job_submissions: {
        Row: {
          id: string
          technician_id: string
          client_name: string
          client_phone: string | null
          client_email: string | null
          client_preferred_contact: 'phone' | 'email' | 'sms'
          client_consent_contact: boolean
          client_consent_share: boolean
          service_category: string
          service_type: string
          service_location: string
          service_date: string
          service_duration: number
          satisfaction_rating: number
          description: string
          status: 'pending' | 'approved' | 'rejected'
          before_photos: string[]
          after_photos: string[]
          process_photos: string[]
          report_id: string | null
          report_url: string | null
          franchisee_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          technician_id: string
          client_name: string
          client_phone?: string | null
          client_email?: string | null
          client_preferred_contact?: 'phone' | 'email' | 'sms'
          client_consent_contact?: boolean
          client_consent_share?: boolean
          service_category: string
          service_type: string
          service_location: string
          service_date: string
          service_duration: number
          satisfaction_rating: number
          description: string
          status?: 'pending' | 'approved' | 'rejected'
          before_photos?: string[]
          after_photos?: string[]
          process_photos?: string[]
          report_id?: string | null
          report_url?: string | null
          franchisee_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          technician_id?: string
          client_name?: string
          client_phone?: string | null
          client_email?: string | null
          client_preferred_contact?: 'phone' | 'email' | 'sms'
          client_consent_contact?: boolean
          client_consent_share?: boolean
          service_category?: string
          service_type?: string
          service_location?: string
          service_date?: string
          service_duration?: number
          satisfaction_rating?: number
          description?: string
          status?: 'pending' | 'approved' | 'rejected'
          before_photos?: string[]
          after_photos?: string[]
          process_photos?: string[]
          report_id?: string | null
          report_url?: string | null
          franchisee_id?: string
          updated_at?: string
        }
      }
      job_reports: {
        Row: {
          id: string
          job_submission_id: string
          report_id: string
          shareable_url: string
          sent_to_client: boolean
          sent_method: 'phone' | 'email' | 'sms' | null
          sent_at: string | null
          custom_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          job_submission_id: string
          report_id: string
          shareable_url: string
          sent_to_client?: boolean
          sent_method?: 'phone' | 'email' | 'sms' | null
          sent_at?: string | null
          custom_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          job_submission_id?: string
          report_id?: string
          shareable_url?: string
          sent_to_client?: boolean
          sent_method?: 'phone' | 'email' | 'sms' | null
          sent_at?: string | null
          custom_message?: string | null
        }
      }
    }
  }
}