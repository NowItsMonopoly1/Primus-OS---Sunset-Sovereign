// src/hooks/useCurrentProfile.ts
// Hook to get current user profile

import { useState, useEffect } from 'react';
import { Profile } from '../data/continuityData';
import { useAuth } from '../contexts/AuthContext';

export const useCurrentProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Map auth user to profile
      const roleMap: Record<string, Profile['role']> = {
        'FOUNDER': 'founder',
        'JUNIOR_AGENT': 'junior',
        'READ_ONLY': 'viewer'
      };

      const profileData: Profile = {
        id: user.id,
        name: user.displayName || user.email,
        role: roleMap[user.role] || 'viewer',
        email: user.email
      };

      setProfile(profileData);
      setLoading(false);
    } else if (!loading) {
      setProfile(null);
      setLoading(false);
    }
  }, [user, loading]);

  return { profile, loading, error };
};