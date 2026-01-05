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
  signOut: () => Promise<void>;
  refetchProfile: (userId?: string) => Promise<void>;
  saveLocalProfile: (data: Partial<Profile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Local storage fallback for guests
  const [localProfile, setLocalProfile] = useLocalStorage<Profile | null>('calorel_local_profile', null);

  // Función interna para buscar perfil con manejo de errores
  const _fetchProfileData = async (userId: string) => {
    const { data: userProfile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return userProfile;
  };

  const fetchProfile = async (userId: string) => {
    try {
      const userProfile = await _fetchProfileData(userId);
      
      if (userProfile) {
        const profileData = { ...userProfile, is_guest: false };
        setProfile(profileData);
        // GUARDAR EN CACHÉ LOCAL para evitar carga infinita en futuros inicios
        try {
          window.localStorage.setItem(`calorel_auth_profile_${userId}`, JSON.stringify(profileData));
        } catch (e) {
          console.warn("Failed to cache auth profile", e);
        }
      }
    } catch (e) {
      console.error("Error fetching profile:", e);
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
            
            // ESTRATEGIA CACHE-FIRST:
            // 1. Intentar cargar inmediatamente desde localStorage si existe
            try {
              const cachedProfileStr = window.localStorage.getItem(`calorel_auth_profile_${initialSession.user.id}`);
              if (cachedProfileStr) {
                const cachedProfile = JSON.parse(cachedProfileStr);
                setProfile(cachedProfile);
                // Si cargamos de caché, podemos quitar el loading inmediatamente para mostrar UI
                // mientras la red actualiza en segundo plano.
              }
            } catch (cacheErr) {
              console.warn("Error reading cached profile", cacheErr);
            }

            // 2. Lógica de Red (Background update o Initial fetch)
            let attempts = 0;
            const maxAttempts = 3;
            let profileLoaded = false;

            while (attempts < maxAttempts && !profileLoaded && mounted) {
              try {
                const userProfile = await _fetchProfileData(initialSession.user.id);
                if (userProfile) {
                  const profileData = { ...userProfile, is_guest: false };
                  setProfile(profileData);
                  // Actualizar caché
                  window.localStorage.setItem(`calorel_auth_profile_${initialSession.user.id}`, JSON.stringify(profileData));
                  profileLoaded = true;
                } else {
                  // Si no hay perfil pero hay usuario, quizás se está creando. Esperamos un poco.
                  throw new Error("Profile not found yet");
                }
              } catch (e) {
                attempts++;
                if (attempts < maxAttempts) {
                  // Esperar exponencialmente antes de reintentar
                  await new Promise(resolve => setTimeout(resolve, 500 * attempts));
                } else {
                  console.error("Failed to load profile from network after retries");
                }
              }
            }
          } else {
            // NO HAY USUARIO (INVITADO)
            if (localProfile) {
              setProfile(localProfile);
            }
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Fallback de emergencia a perfil local de invitado
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
        // Al hacer login explícito, mostramos loading mientras traemos datos frescos
        setLoading(true); 
        await fetchProfile(newSession.user.id);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setLocalProfile(null);
        // Limpiar caché de perfil autenticado al salir
        // No borramos todo localStorage para no afectar configuraciones globales
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED') {
        // Mantener sesión
      } else if (event === 'INITIAL_SESSION') {
        // Manejado por initializeAuth
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
      
      // Limpiar datos locales específicos
      if (user?.id) {
        window.localStorage.removeItem(`calorel_auth_profile_${user.id}`);
      }
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