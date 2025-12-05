import { createContext, useContext, useEffect } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";

interface SnowContextValue {
  snowEnabled: boolean;
  setSnowEnabled: (value: boolean) => void;
}

const SnowContext = createContext<SnowContextValue | undefined>(undefined);

export const SnowProvider = ({ children }: { children: React.ReactNode }) => {
  const [snowEnabled, setSnowEnabled] = useLocalStorage<boolean>("calorel_snow_enabled", true);

  // Asegurar valor por defecto
  useEffect(() => {
    if (snowEnabled === undefined || snowEnabled === null) {
      setSnowEnabled(true);
    }
  }, [snowEnabled, setSnowEnabled]);

  return (
    <SnowContext.Provider value={{ snowEnabled: !!snowEnabled, setSnowEnabled }}>
      {children}
    </SnowContext.Provider>
  );
};

export const useSnow = () => {
  const ctx = useContext(SnowContext);
  if (!ctx) {
    throw new Error("useSnow must be used within a SnowProvider");
  }
  return ctx;
};