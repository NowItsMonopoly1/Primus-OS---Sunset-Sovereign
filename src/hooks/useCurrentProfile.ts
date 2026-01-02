// src/hooks/useCurrentProfile.ts
// Hook to get current user profile

import { useState, useEffect } from 'react';
import { Profile } from '../data/continuityData';
import { getCurrentProfile } from '../data/fakeApi';

export const useCurrentProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getCurrentProfile();
        setProfile(data);
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return { profile, loading, error };
};