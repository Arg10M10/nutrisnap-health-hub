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
        return null;
      } else if (userProfile) {
        setProfile(userProfile);
        return userProfile;
      } else {
        console.warn("Profile not found, creating default profile for user:", userId);
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ id: userId }])
          .select()
          .single();
        
        if (createError) {
          console.error("Error creating fallback profile:", createError);
          return null;
        } else {
          setProfile(newProfile);
          return newProfile;
        }
      }
    } catch (e) {
      console.error("Fetch profile exception:", e);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth initialization error:", error);
          if (mounted) {
            setSession(null);
            setUser(null);
            setProfile(null);
          }
        } else if (mounted) {
          if (initialSession?.user) {
            setSession(initialSession);
            setUser(initialSession.user);
            // Wait for profile BEFORE setting loading to false
            await fetchProfile(initialSession.user.id);
          } else {
            setSession(null);
            setUser(null);
            setProfile(null);
          }
        }
      } catch (error) {
        console.error("Auth initialization unexpected error:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (mounted) {
        // When signing in, we might want to show loading state again or handle it gracefully
        if (event === 'SIGNED_IN' && newSession?.user) {
           setSession(newSession);
           setUser(newSession.user);
           // Fetch profile immediately
           await fetchProfile(newSession.user.id);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
        } else if (event === 'TOKEN_REFRESHED' && newSession) {
           setSession(newSession);
           setUser(newSession.user);
        }
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
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setProfile(null);
      setUser(null);
      setSession(null);
    }
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