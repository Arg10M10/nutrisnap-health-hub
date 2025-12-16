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

  const fetchProfile = async (userId: string) => {
    try {
      const { data: userProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching profile:", error);
      }
      
      setProfile(userProfile);
    } catch (e) {
      console.error("Critical profile fetch error:", e);
      setProfile(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Initial session check
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          if (session?.user) {
            setSession(session);
            setUser(session.user);
            // AWAIT the profile fetch so loading stays true until we have data
            await fetchProfile(session.user.id);
          }
        }
      } catch (error) {
        console.error("Session init error:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;

      if (newSession?.user) {
         setSession(newSession);
         setUser(newSession.user);
         
         // If user changed, fetch profile again
         if (newSession.user.id !== user?.id) {
            // We can optionally set loading true here if we want a hard transition
            // but usually strictly awaiting is enough for the initial load.
            await fetchProfile(newSession.user.id);
         }
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
      }
      // Ensure loading is false after auth state settles
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
    setSession(null);
  };

  const refetchProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
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