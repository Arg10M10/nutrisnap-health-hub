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
      
      if (error) {
        console.error("Error fetching profile:", error);
      }
      
      if (userProfile) {
        setProfile({ ...userProfile, is_guest: false });
      } else {
        // If row doesn't exist yet but user does (rare race condition or DB error)
        // We keep loading false so app doesn't hang
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
        // 1. Obtener sesión localmente (rápido)
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (mounted) {
          if (initialSession?.user) {
            // USUARIO LOGUEADO
            setSession(initialSession);
            setUser(initialSession.user);
            
            // Intentar cargar perfil de DB, pero no bloquear la UI indefinidamente
            // Si falla o tarda, la UI ya tiene sesión y podría mostrar skeletons o estado parcial
            await fetchProfile(initialSession.user.id);
          } else {
            // NO HAY USUARIO (INVITADO)
            // Cargar perfil local si existe
            if (localProfile) {
              setProfile(localProfile);
            }
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Fallback de emergencia a perfil local
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

      // Actualizar estado base
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (event === 'SIGNED_IN' && newSession?.user) {
        setLoading(true); // Mostrar carga brevemente al iniciar sesión
        await fetchProfile(newSession.user.id);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setLocalProfile(null);
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED') {
        // No hacer nada visual, solo mantener sesión
      } else if (event === 'INITIAL_SESSION') {
        // Ya manejado por initializeAuth, pero aseguramos que loading se apague
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Dependencia vacía para correr solo al montar

  const signOut = async () => {
    try {
      setLoading(true); 
      await supabase.auth.signOut();
      window.localStorage.removeItem('calorel_local_profile');
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      // Limpiar todo el estado
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