// backend/src/supabaseClient.ts
// Supabase client setup for PRIMUS OS Backend

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key';

if (!supabaseUrl || !supabaseServiceKey || supabaseUrl === 'https://your-project.supabase.co') {
  console.warn('⚠️  Supabase not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Helper function to get user from JWT token
export const getUserFromToken = async (token: string) => {
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error) throw error;
  return user;
};

// Helper function to get firm ID from user ID
export const getFirmIdFromUserId = async (userId: string): Promise<string> => {
  const { data, error } = await supabase
    .from('users')
    .select('firm_id')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data.firm_id;
};