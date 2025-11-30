import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  full_name: string;
  onboarding_completed: boolean;
  [key: string]: any;
};

interface SessionContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  updateProfile: (newProfileData: Partial<Profile>) => void;
}

const SessionContext = createContext<SessionContextValue>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  updateProfile: () => {},
});

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const updateProfile = (newProfileData: Partial<Profile>) => {
    setProfile((prevProfile) => {
      if (!prevProfile) return null;
      return { ...prevProfile, ...newProfileData };
    });
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setProfile(profileData);
      } else {
        setProfile(null);
      }
      
      // This is the key: the listener fires on page load.
      // After it runs for the first time, we know the initial auth state,
      // so we can safely stop the loading indicator.
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <SessionContext.Provider value={{ session, user, profile, loading, updateProfile }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);