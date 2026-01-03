// src/contexts/AuthContext.tsx
// Authentication context with role-based permissions

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

export type UserRole = 'FOUNDER' | 'JUNIOR_AGENT' | 'READ_ONLY';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firmId: string;
  displayName: string | null;
  isActive: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isFounder: boolean;
  isJunior: boolean;
  isReadOnly: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // TEMPORARY BYPASS - Auto-login with mock founder user
  const [user, setUser] = useState<AuthUser | null>({
    id: 'b418cf2e-8a64-4fe0-b69e-68b07af9baa5',
    email: 'testuser@gmail.com',
    role: 'FOUNDER',
    firmId: '00000000-0000-0000-0000-000000000001',
    displayName: 'Test Founder',
    isActive: true
  });
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch user profile from users table
  const fetchUserProfile = async (authUserId: string): Promise<AuthUser | null> => {
    try {
      let { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUserId)
        .single();

      // If user doesn't exist, create them
      if (error && error.code === 'PGRST116') {
        const { data: authUser } = await supabase.auth.getUser();
        if (authUser.user) {
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
              id: authUserId,
              firm_id: '00000000-0000-0000-0000-000000000001', // WAL firm
              email: authUser.user.email,
              role: 'FOUNDER',
              display_name: 'Test Founder',
              is_active: true
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error creating user profile:', insertError);
            return null;
          }
          data = newUser;
        }
      } else if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return {
        id: data.id,
        email: data.email,
        role: data.role as UserRole,
        firmId: data.firm_id,
        displayName: data.display_name,
        isActive: data.is_active,
      };
    } catch (err) {
      console.error('Unexpected error fetching user profile:', err);
      return null;
    }
  };

  // Initialize auth state - BYPASS AUTH FOR NOW
  useEffect(() => {
    // Skip all auth checks - user is already set to mock founder
    // No need to fetch from Supabase
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signOut,
    isFounder: user?.role === 'FOUNDER',
    isJunior: user?.role === 'JUNIOR_AGENT',
    isReadOnly: user?.role === 'READ_ONLY',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
