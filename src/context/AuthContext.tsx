import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import useLocalStorage from '@/hooks/useLocalStorage';
import { toast } from 'sonner';

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
  is_guest?: boolean;
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
  
  // Referencias para evitar problemas de closure en efectos asíncronos
  const profileRef = useRef<Profile | null>(null);
  const mountedRef = useRef(true);

  // Mantener ref sincronizada
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);
  
  const [localProfile, setLocalProfile] = useLocalStorage<Profile | null>('calorel_local_profile', null);

  const cacheProfile = (userId: string, data: Profile) => {
    try {
      localStorage.setItem(`calorel_auth_profile_${userId}`, JSON.stringify(data));
    } catch (e) {
      console.warn("Failed to cache profile", e);
    }
  };

  const getCachedProfile = (userId: string): Profile | null => {
    try {
      const cached = localStorage.getItem(`calorel_auth_profile_${userId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  };

  // Función robusta para cargar perfil
  const fetchProfile = async (userId: string, isSilentUpdate = false) => {
    // Si es una actualización silenciosa (ya tenemos datos), no mostramos loading
    if (!isSilentUpdate) {
      setLoading(true);
    }

    try {
      // Intentamos cargar de caché primero para respuesta instantánea
      if (!isSilentUpdate) {
        const cached = getCachedProfile(userId);
        if (cached) {
          setProfile(cached);
          // Si encontramos caché, ya podemos dejar de cargar visualmente mientras actualizamos en background
          setLoading(false);
        }
      }

      // Timeout corto para la red (3s), si falla, nos quedamos con lo que tengamos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Network timeout")), 4000)
      );

      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      // @ts-ignore
      const { data: userProfile, error } = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (error) throw error;
      
      if (userProfile && mountedRef.current) {
        const sanitizedProfile: Profile = {
          ...userProfile,
          is_guest: false,
          // Defaults para evitar UI rota
          goal_calories: userProfile.goal_calories || 2000,
          goal_protein: userProfile.goal_protein || 100,
          goal_carbs: userProfile.goal_carbs || 250,
          goal_fats: userProfile.goal_fats || 60,
          goal_sugars: userProfile.goal_sugars || 30,
          goal_fiber: userProfile.goal_fiber || 25,
          is_subscribed: userProfile.is_subscribed || false,
          plan_type: userProfile.plan_type || null,
        };
        
        setProfile(sanitizedProfile);
        cacheProfile(userId, sanitizedProfile);
      }
    } catch (e) {
      console.error("Profile fetch error:", e);
      // Si falló la red y no teníamos caché ni perfil cargado, intentamos recuperar sesión local de emergencia
      // o simplemente dejamos de cargar para no bloquear la app
    } finally {
      if (mountedRef.current && !isSilentUpdate) {
        setLoading(false);
      }
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
    mountedRef.current = true;

    // Timeout de seguridad global: En 3s, pase lo que pase, quitamos el loading.
    // Esto es crítico para evitar la "carga infinita" si Supabase se cuelga.
    const safetyTimeout = setTimeout(() => {
      if (mountedRef.current) {
        setLoading((prev) => {
          if (prev) console.log("Safety timeout triggered: Forcing loading false");
          return false;
        });
      }
    }, 3000);

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        if (mountedRef.current) {
          if (initialSession?.user) {
            const userId = initialSession.user.id;
            setSession(initialSession);
            setUser(initialSession.user);
            // Carga inicial
            await fetchProfile(userId, false);
          } else {
            // Usuario invitado
            if (localProfile) {
              setProfile(localProfile);
            }
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Auth init error:", error);
        if (localProfile) setProfile(localProfile);
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mountedRef.current) return;

      // Actualizar sesión básica
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (event === 'SIGNED_IN' && newSession?.user) {
        const userId = newSession.user.id;
        // CRÍTICO: Solo bloqueamos la UI si NO tenemos el perfil de este usuario ya cargado.
        // Si cambiamos de app y volvemos, 'event' puede dispararse, pero si ya tenemos datos,
        // hacemos un refetch silencioso (isSilentUpdate = true).
        const alreadyLoaded = profileRef.current?.id === userId;
        await fetchProfile(userId, alreadyLoaded);
      } 
      else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
        // Refresco de token: siempre silencioso
        console.log("Token refreshed");
      }
      else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setLocalProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mountedRef.current = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []); 

  const signOut = async () => {
    try {
      setLoading(true); 
      await supabase.auth.signOut();
      if (user?.id) {
        localStorage.removeItem(`calorel_auth_profile_${user.id}`);
      }
      localStorage.removeItem('calorel_local_profile');
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
      await fetchProfile(targetId, true); // Forzamos silencioso para no parpadear
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