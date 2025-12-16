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

  // Fallback profile if DB fetch fails (prevents UI crash)
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
      // Direct fetch from Supabase. No local caching as requested.
      const { data: userProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (userProfile) {
        setProfile(userProfile);
      } else {
        // If no profile exists yet (new user), use fallback until created
        if (error) console.error("Error fetching profile:", error);
        setProfile(createFallbackProfile(userId, userEmail));
      }
    } catch (e) {
      console.error("Critical profile fetch error:", e);
      setProfile(createFallbackProfile(userId, userEmail));
    }
  };

  useEffect(() => {
    let mounted = true;

    // Standard, simple Supabase Auth initialization
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          fetchProfile(session.user.id, session.user.email);
        }
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;

      if (newSession?.user) {
         setSession(newSession);
         setUser(newSession.user);
         // Only fetch profile if it's a different user or initial load
         if (newSession.user.id !== user?.id) {
            fetchProfile(newSession.user.id, newSession.user.email);
         }
         setLoading(false);
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
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