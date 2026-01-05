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

  // Helper para guardar en caché segura
  const cacheProfile = (userId: string, data: Profile) => {
    try {
      localStorage.setItem(`calorel_auth_profile_${userId}`, JSON.stringify(data));
    } catch (e) {
      console.warn("Failed to cache profile", e);
    }
  };

  // Helper para leer de caché segura
  const getCachedProfile = (userId: string): Profile | null => {
    try {
      const cached = localStorage.getItem(`calorel_auth_profile_${userId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  };

  // Helper para construir un perfil de emergencia si la red falla
  const buildFallbackProfile = (user: User): Profile => {
    const meta = user.user_metadata || {};
    return {
      id: user.id,
      full_name: meta.full_name || 'Usuario',
      updated_at: new Date().toISOString(),
      onboarding_completed: true, // Asumimos true para dejarlo entrar
      diet_onboarding_completed: false,
      gender: null,
      age: null,
      previous_apps_experience: null,
      weight: null,
      height: null,
      units: 'metric',
      motivation: null,
      goal: 'maintain_weight',
      goal_weight: null,
      starting_weight: null,
      goal_calories: 2000,
      goal_protein: 100,
      goal_carbs: 250,
      goal_fats: 60,
      goal_sugars: 30,
      goal_fiber: 25,
      weekly_rate: 0,
      avatar_color: null,
      time_format: '12h',
      is_subscribed: true, // Asumimos suscripción si falló la carga (mejor acceso gratis que bloqueo)
      trial_start_date: null,
      subscription_end_date: null,
      plan_type: null,
      is_guest: false
    };
  };

  const fetchProfile = async (userId: string) => {
    try {
      // Intentamos obtener de la red con un Promise.race para timeout
      // Si Supabase tarda más de 5 segundos, abortamos y usamos caché o fallback
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Network timeout")), 6000)
      );

      // @ts-ignore
      const { data: userProfile, error } = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (error) {
        console.error("Error fetching profile from Supabase:", error);
        // Si hay error pero tenemos caché, nos quedamos con la caché (ya cargada en useEffect)
        return; 
      }
      
      if (userProfile) {
        const profileData = { ...userProfile, is_guest: false };
        setProfile(profileData);
        cacheProfile(userId, profileData);
      }
    } catch (e) {
      console.error("Profile fetch failed or timed out:", e);
      // En caso de fallo catastrófico de red, si no hay perfil cargado, creamos uno de emergencia
      // para que el usuario NO se quede en pantalla blanca.
      if (!profile) {
        // Necesitamos el objeto User para esto. Si estamos aquí, fetchProfile se llamó con un ID.
        // Intentamos usar el estado actual o recuperar sesión básica.
        const currentUser = user || (await supabase.auth.getUser()).data.user;
        if (currentUser && currentUser.id === userId) {
           const fallback = buildFallbackProfile(currentUser);
           console.log("Using fallback profile due to network error");
           setProfile(fallback);
        }
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
    let mounted = true;

    const initializeAuth = async () => {
      // Timeout de seguridad: Si en 7 segundos no hemos terminado, forzar loading=false
      // Esto es el "botón de pánico" automático para el spinner infinito.
      const safetyTimeout = setTimeout(() => {
        if (mounted) setLoading(false);
      }, 7000);

      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (mounted) {
          if (initialSession?.user) {
            setSession(initialSession);
            setUser(initialSession.user);
            
            const userId = initialSession.user.id;

            // 1. CACHÉ: Intentar cargar inmediatamente
            try {
              const cachedProfileStr = window.localStorage.getItem(`calorel_auth_profile_${userId}`);
              if (cachedProfileStr) {
                const cachedProfile = JSON.parse(cachedProfileStr);
                setProfile(cachedProfile);
                setLoading(false); // ¡Desbloquear UI inmediatamente!
              }
            } catch (cacheErr) {
              console.warn("Error reading cached profile", cacheErr);
            }

            // 2. RED: Actualizar en segundo plano
            await fetchProfile(userId);
            
          } else {
            if (localProfile) {
              setProfile(localProfile);
            }
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Fallback final
        if (mounted && localProfile && !profile) {
           setProfile(localProfile);
        }
      } finally {
        if (mounted) {
          clearTimeout(safetyTimeout);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (event === 'SIGNED_IN' && newSession?.user) {
        setLoading(true); 
        await fetchProfile(newSession.user.id);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setLocalProfile(null);
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
      setLoading(true); 
      await supabase.auth.signOut();
      if (user?.id) {
        window.localStorage.removeItem(`calorel_auth_profile_${user.id}`);
      }
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