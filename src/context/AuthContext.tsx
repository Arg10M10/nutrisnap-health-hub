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

  const fetchProfile = async (userId: string) => {
    try {
      // Intentamos obtener de la red
      const { data: userProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching profile from Supabase:", error);
        return; // Si falla la red, no hacemos nada (nos quedamos con la caché)
      }
      
      if (userProfile) {
        const profileData = { ...userProfile, is_guest: false };
        // Actualizamos estado y caché con los datos frescos
        setProfile(profileData);
        cacheProfile(userId, profileData);
      }
    } catch (e) {
      console.error("Network request failed completely:", e);
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
        // 1. Obtener sesión (Esto verifica el token local, no hace request de red pesado)
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        if (mounted) {
          if (initialSession?.user) {
            // --- USUARIO AUTENTICADO ---
            const userId = initialSession.user.id;
            
            setSession(initialSession);
            setUser(initialSession.user);

            // A. CACHE FIRST: Intentar cargar perfil inmediatamente de localStorage
            const cachedProfile = getCachedProfile(userId);
            
            if (cachedProfile) {
              console.log("Profile loaded from cache immediately");
              setProfile(cachedProfile);
              // CRÍTICO: Si tenemos caché, terminamos la carga YA para mostrar la app
              setLoading(false); 
            }

            // B. NETWORK UPDATE: Actualizar en segundo plano (Background Sync)
            // No usamos 'await' aquí si ya tenemos caché para no bloquear
            const updatePromise = fetchProfile(userId);
            
            if (!cachedProfile) {
              // Si NO había caché, ahí sí tenemos que esperar a la red
              await updatePromise;
            }
            
          } else {
            // --- USUARIO INVITADO / NO LOGUEADO ---
            if (localProfile) {
              setProfile(localProfile);
            }
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Fallback de emergencia
        if (mounted && localProfile) {
           setProfile(localProfile);
        }
      } finally {
        if (mounted) {
          // Asegurarnos de que loading siempre termina
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
        
        // Al hacer login manual, sí queremos esperar un poco para traer datos frescos
        // pero igual intentamos caché primero
        const cached = getCachedProfile(newSession.user.id);
        if (cached) setProfile(cached);
        
        setLoading(true);
        await fetchProfile(newSession.user.id);
        setLoading(false);
      } 
      else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setSession(null);
        setUser(null);
        setLoading(false);
      } 
      else if (event === 'TOKEN_REFRESHED') {
        setSession(newSession);
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
      
      // Opcional: Limpiar caché al salir explícitamente para privacidad
      if (user?.id) {
        localStorage.removeItem(`calorel_auth_profile_${user.id}`);
      }
      
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