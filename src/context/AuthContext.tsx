import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
    let attempts = 0;
    const MAX_RETRIES = 3;
    
    while (attempts < MAX_RETRIES) {
      try {
        // 1. Timeout de 5 segundos para no dejar la app colgada
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Timeout")), 5000)
        );

        // 2. Carga optimizada: Traemos solo lo necesario (aunque profile es pequeño)
        const fetchPromise = supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        // @ts-ignore
        const { data: userProfile, error } = await Promise.race([fetchPromise, timeoutPromise]);
        
        if (error) throw error;
        
        if (userProfile) {
          // 3. Sanitización y Defaults: Evitar crashes por datos incompletos
          const sanitizedProfile: Profile = {
            ...userProfile,
            is_guest: false,
            // Defaults seguros
            goal_calories: userProfile.goal_calories || 2000,
            goal_protein: userProfile.goal_protein || 100,
            goal_carbs: userProfile.goal_carbs || 250,
            goal_fats: userProfile.goal_fats || 60,
            goal_sugars: userProfile.goal_sugars || 30,
            goal_fiber: userProfile.goal_fiber || 25,
            is_subscribed: userProfile.is_subscribed || false,
            plan_type: userProfile.plan_type || null,
            // Mantener otros campos aunque sean null si la UI lo maneja bien
          };
          
          setProfile(sanitizedProfile);
          cacheProfile(userId, sanitizedProfile);
          return; // Éxito: Salimos del bucle
        } else {
           // Perfil no encontrado en DB (raro para usuario auth, pero posible)
           throw new Error("Perfil no encontrado");
        }

      } catch (e) {
        attempts++;
        console.warn(`Profile fetch attempt ${attempts} failed:`, e);
        
        if (attempts >= MAX_RETRIES) {
           console.error("Max retries reached for profile fetch");
           // Solo mostramos error si el usuario NO tiene datos cargados (está bloqueado)
           // Si ya tiene caché, este fallo es silencioso (background update fail)
           const hasCache = getCachedProfile(userId);
           if (!hasCache && !profile) {
             toast.error("No se pudo cargar tu cuenta. Por favor, revisa tu conexión.");
           }
        } else {
           // Esperar 2 segundos antes de reintentar
           await new Promise(r => setTimeout(r, 2000));
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
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        if (mounted) {
          if (initialSession?.user) {
            const userId = initialSession.user.id;
            
            setSession(initialSession);
            setUser(initialSession.user);

            // A. CACHE FIRST: Carga inmediata si existe
            const cachedProfile = getCachedProfile(userId);
            if (cachedProfile) {
              setProfile(cachedProfile);
              setLoading(false); // Desbloquear UI inmediatamente
              
              // B. BACKGROUND UPDATE: Actualizar datos frescos sin bloquear
              fetchProfile(userId);
            } else {
              // C. NO CACHE: Esperar a la red (Login nuevo o limpieza de datos)
              await fetchProfile(userId);
              setLoading(false);
            }
            
          } else {
            // Usuario invitado
            if (localProfile) {
              setProfile(localProfile);
            }
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Fallback final de emergencia
        if (mounted && localProfile) {
           setProfile(localProfile);
        }
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && newSession?.user) {
        setSession(newSession);
        setUser(newSession.user);
        
        // Al iniciar sesión manualmente, mostrar loading mientras intentamos cargar
        // Si hay caché vieja, la usamos
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
      if (user?.id) {
        // Opcional: Limpiar caché al cerrar sesión explícitamente
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