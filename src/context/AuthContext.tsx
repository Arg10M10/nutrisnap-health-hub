import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  full_name: string;
  updated_at: string;
  onboarding_completed: boolean;
  diet_onboarding_completed: boolean;
  gender: string | null;
  age: number | null;
  previous_apps_experience: string | null;
  weight: number | null;
  height: number | null;
  units: string | null;
  motivation: string | null;
  goal: string | null;
  goal_weight: number | null;
  starting_weight: number | null;
  goal_calories: number | null;
  goal_protein: number | null;
  goal_carbs: number | null;
  goal_fats: number | null;
  goal_sugars: number | null;
  weekly_rate: number | null;
  avatar_color: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => void;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to create a safe fallback profile
  const createFallbackProfile = (userId: string, email?: string): Profile => ({
    id: userId,
    full_name: email?.split('@')[0] || 'User',
    updated_at: new Date().toISOString(),
    onboarding_completed: false, 
    diet_onboarding_completed: false,
    gender: null,
    age: null,
    previous_apps_experience: null,
    weight: null,
    height: null,
    units: 'metric',
    motivation: null,
    goal: null,
    goal_weight: null,
    starting_weight: null,
    goal_calories: 2000,
    goal_protein: 90,
    goal_carbs: 220,
    goal_fats: 65,
    goal_sugars: 25,
    weekly_rate: null,
    avatar_color: null
  });

  const fetchProfile = async (userId: string, userEmail?: string) => {
    try {
      // 1. Try to get from Supabase DB
      const { data: userProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (userProfile) {
        setProfile(userProfile);
        // Cache for next time
        localStorage.setItem(`profile_${userId}`, JSON.stringify(userProfile));
        return;
      }

      if (error) console.error("Error fetching profile from DB:", error);

      // 2. If DB failed, try Cache
      const cachedProfile = localStorage.getItem(`profile_${userId}`);
      if (cachedProfile) {
        setProfile(JSON.parse(cachedProfile));
        return;
      }

      // 3. Fallback
      setProfile(createFallbackProfile(userId, userEmail));

    } catch (e) {
      console.error("Critical profile fetch error:", e);
      setProfile(createFallbackProfile(userId, userEmail));
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Enforce a timeout specifically for the initial session load.
        // On native devices, accessing storage can sometimes hang.
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<{ data: { session: null } }>((resolve) => 
          setTimeout(() => resolve({ data: { session: null } }), 2000)
        );

        // Race: If Supabase takes > 2 seconds, we proceed with null session (or previous state)
        // to unblock the UI.
        const { data: { session: initialSession } } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as { data: { session: Session | null } };
        
        if (mounted) {
          if (initialSession?.user) {
            setSession(initialSession);
            setUser(initialSession.user);
            
            // OPTIMIZATION: Try to load profile from cache immediately to unblock UI
            // Don't await the DB call for the loading state flip.
            const cachedProfile = localStorage.getItem(`profile_${initialSession.user.id}`);
            if (cachedProfile) {
              try {
                setProfile(JSON.parse(cachedProfile));
              } catch (e) { /* ignore */ }
            }
            
            // Fetch fresh data in background
            fetchProfile(initialSession.user.id, initialSession.user.email);
          }
        }
      } catch (error) {
        console.error("Auth init error:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && newSession?.user) {
         setSession(newSession);
         setUser(newSession.user);
         fetchProfile(newSession.user.id, newSession.user.email);
         setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && newSession) {
         setSession(newSession);
         setUser(newSession.user);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setProfile(null);
      setUser(null);
      setSession(null);
    }
  };

  const refetchProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.email);
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signOut,
    refetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};