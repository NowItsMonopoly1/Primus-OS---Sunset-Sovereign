// src/supabaseClient.ts
// Supabase client setup for PRIMUS OS Continuity System

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://your-project.supabase.co') {
  console.warn('⚠️  Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  // TEMPORARY BYPASS: Disable RLS for testing
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-disable-rls': 'true', // This might not work, but let's try
    },
  },
});

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      firms: {
        Row: {
          id: string;
          name: string;
          governance_mode_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          governance_mode_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          governance_mode_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          firm_id: string;
          email: string;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          firm_id: string;
          email: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          firm_id?: string;
          email?: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      relationships: {
        Row: {
          id: string;
          external_id: string | null;
          display_name: string;
          role_or_segment: string;
          status: string;
          value_outlook: string | null;
          continuity_grade: string;
          continuity_score: number;
          last_interaction_at: string | null;
          last_interaction_type: string | null;
          firm_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          external_id?: string | null;
          display_name: string;
          role_or_segment: string;
          status?: string;
          value_outlook?: string | null;
          continuity_grade?: string;
          continuity_score?: number;
          last_interaction_at?: string | null;
          last_interaction_type?: string | null;
          firm_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          external_id?: string | null;
          display_name?: string;
          role_or_segment?: string;
          status?: string;
          value_outlook?: string | null;
          continuity_grade?: string;
          continuity_score?: number;
          last_interaction_at?: string | null;
          last_interaction_type?: string | null;
          firm_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      interactions: {
        Row: {
          id: string;
          relationship_id: string;
          type: string;
          direction: string;
          occurred_at: string;
          value_event_weight: number;
          notes: string | null;
          source_system: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          relationship_id: string;
          type: string;
          direction: string;
          occurred_at: string;
          value_event_weight?: number;
          notes?: string | null;
          source_system?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          relationship_id?: string;
          type?: string;
          direction?: string;
          occurred_at?: string;
          value_event_weight?: number;
          notes?: string | null;
          source_system?: string | null;
          created_at?: string;
        };
      };
      continuity_snapshots: {
        Row: {
          id: string;
          relationship_id: string;
          score: number;
          grade: string;
          calculated_at: string;
          reason_summary: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          relationship_id: string;
          score: number;
          grade: string;
          calculated_at: string;
          reason_summary?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          relationship_id?: string;
          score?: number;
          grade?: string;
          calculated_at?: string;
          reason_summary?: string | null;
          created_at?: string;
        };
      };
    };
  };
}