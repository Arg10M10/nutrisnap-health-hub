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

  // Helper to create a safe fallback profile from user metadata
  // This ensures the app can ALWAYS render something, avoiding the white screen death
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
      // 1. Try to get from Supabase
      const { data: userProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (userProfile) {
        setProfile(userProfile);
        localStorage.setItem(`profile_${userId}`, JSON.stringify(userProfile));
        return;
      }

      if (error) {
        console.error("Error fetching profile from DB:", error);
      }

      // 2. If DB failed or returned null, try Local Storage
      const cachedProfile = localStorage.getItem(`profile_${userId}`);
      if (cachedProfile) {
        console.log("Using cached profile due to DB error/miss");
        setProfile(JSON.parse(cachedProfile));
        return;
      }

      // 3. Absolute failsafe: Use synthetic profile
      // If we are here, we have a session but NO profile data anywhere.
      // We must set a profile so the app doesn't hang.
      console.log("Creating fallback profile");
      const fallback = createFallbackProfile(userId, userEmail);
      setProfile(fallback);
      
      // Optionally try to insert this fallback to DB to fix the account
      supabase.from('profiles').insert([fallback]).then(({ error }) => {
        if (error) console.error("Auto-fix profile insertion failed", error);
      });

    } catch (e) {
      console.error("Critical profile fetch error:", e);
      // Even in a crash, set fallback
      setProfile(createFallbackProfile(userId, userEmail));
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get session from storage (very fast)
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession?.user) {
          if (mounted) {
            setSession(initialSession);
            setUser(initialSession.user);
            // WAIT for profile before finishing loading
            await fetchProfile(initialSession.user.id, initialSession.user.email);
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
         await fetchProfile(newSession.user.id, newSession.user.email);
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