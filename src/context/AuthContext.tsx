import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import useLocalStorage from '@/hooks/useLocalStorage';

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
  goal_fiber: number | null;
  weekly_rate: number | null;
  avatar_color: string | null;
  time_format: '12h' | '24h' | null;
  is_subscribed: boolean;
  trial_start_date: string | null;
  subscription_end_date: string | null;
  plan_type: 'monthly' | 'annual' | null;
  is_guest?: boolean; // New flag for local profiles
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => void;
  refetchProfile: (userId?: string) => Promise<void>;
  saveLocalProfile: (data: Partial<Profile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Local storage fallback
  const [localProfile, setLocalProfile] = useLocalStorage<Profile | null>('calorel_local_profile', null);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: userProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) console.error("Error fetching profile:", error);
      
      if (userProfile) {
        setProfile({ ...userProfile, is_guest: false });
      } else {
        // If row doesn't exist yet but user does, we might be in a race condition with the trigger.
      }
    } catch (e) {
      console.error("Critical profile fetch error:", e);
    }
  };

  const saveLocalProfile = (data: Partial<Profile>) => {
    const updatedProfile = { 
      ...localProfile, 
      ...data,
      is_guest: true,
      updated_at: new Date().toISOString()
    } as Profile;
    
    setLocalProfile(updatedProfile);
    setProfile(updatedProfile);
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // No seteamos loading(true) aquí porque ya inicia en true
        
        // Timeout de seguridad: Si Supabase tarda más de 5s, forzamos el fin de la carga
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth timeout')), 5000)
        );

        // Intentamos obtener sesión con un race contra el timeout
        const sessionPromise = supabase.auth.getSession();
        
        const { data: { session: initialSession } } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;

        if (mounted) {
          if (initialSession?.user) {
            setSession(initialSession);
            setUser(initialSession.user);
            await fetchProfile(initialSession.user.id);
          } else {
            // If no session, load local profile if exists
            if (localProfile) {
              setProfile(localProfile);
            }
          }
        }
      } catch (error) {
        console.error("Auth initialization error or timeout:", error);
        // En caso de error (timeout o red), intentamos cargar perfil local por si acaso
        if (mounted && localProfile) {
           setProfile(localProfile);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (event === 'SIGNED_OUT') {
        setProfile(null);
        setLocalProfile(null); 
        setLoading(false);
      } else if (event === 'SIGNED_IN' && newSession?.user) {
        await fetchProfile(newSession.user.id);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setLoading(true); 
      await supabase.auth.signOut();
      window.localStorage.removeItem('calorel_local_profile');
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setProfile(null);
      setUser(null);
      setSession(null);
      setLocalProfile(null);
      setLoading(false);
    }
  };

  const refetchProfile = async (specificUserId?: string) => {
    const targetId = specificUserId || user?.id;
    
    if (targetId) {
      await fetchProfile(targetId);
    } else if (localProfile) {
      setProfile(localProfile);
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signOut,
    refetchProfile,
    saveLocalProfile
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