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

  // Helper to create a minimal safe profile so the app doesn't crash while loading DB data
  const createTempProfile = (userId: string, email?: string): Profile => ({
    id: userId,
    full_name: email?.split('@')[0] || 'User',
    updated_at: new Date().toISOString(),
    onboarding_completed: false, // Will redirect to onboarding if db fetch fails, safer than crashing
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

  const fetchProfile = async (userId: string) => {
    try {
      const { data: userProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching profile:", error);
        return;
      } 
      
      if (userProfile) {
        setProfile(userProfile);
        // Update cache
        localStorage.setItem(`profile_${userId}`, JSON.stringify(userProfile));
      } else {
        // Profile doesn't exist in DB, create one
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert([{ id: userId }])
          .select()
          .single();
        if (newProfile) {
          setProfile(newProfile);
          localStorage.setItem(`profile_${userId}`, JSON.stringify(newProfile));
        }
      }
    } catch (e) {
      console.error("Exception fetching profile:", e);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 1. Get Session from local storage (fastest)
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession?.user) {
          setSession(initialSession);
          setUser(initialSession.user);
          
          // 2. Try to load profile from Cache IMMEDIATELY
          const cachedProfile = localStorage.getItem(`profile_${initialSession.user.id}`);
          if (cachedProfile) {
            setProfile(JSON.parse(cachedProfile));
          } else {
            // 3. If no cache, set a temp profile so we don't block UI
            // This prevents the white screen "leaf" hang
            setProfile(createTempProfile(initialSession.user.id, initialSession.user.email));
          }

          // 4. Fetch fresh data in background (don't await this for the loading state)
          fetchProfile(initialSession.user.id);
        }
      } catch (error) {
        console.error("Auth init error:", error);
      } finally {
        // 5. Always release loading state immediately after checking local session
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (event === 'SIGNED_IN' && newSession?.user) {
         setSession(newSession);
         setUser(newSession.user);
         // Try cache first on sign in too
         const cached = localStorage.getItem(`profile_${newSession.user.id}`);
         if (cached) setProfile(JSON.parse(cached));
         
         await fetchProfile(newSession.user.id);
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