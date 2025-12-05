import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { NutritionProvider } from "./context/NutritionContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./components/ThemeProvider";

import Index from "./pages/Index";
import Scanner from "./pages/Scanner";
import Progress from "./pages/Progress";
import Diets from "./pages/Diets";
import NotFound from "./pages/NotFound";
import BarcodeResultPage from "@/pages/BarcodeResult";
import Settings from "./pages/Settings";
import Preferences from "./pages/settings/Preferences";
import NutritionalGoals from "./pages/settings/NutritionalGoals";
import Login from "./pages/Login";
import Onboarding from "./pages/onboarding/Onboarding";
import SplashScreen from "./pages/SplashScreen";
import Exercise from "./pages/Exercise";
import Running from "./pages/exercise/Running";
import Weights from "./pages/exercise/Weights";
import WriteExercise from "./pages/exercise/Write";
import ManualExercise from "./pages/exercise/Manual";
import BottomNav from "./components/BottomNav";
import Badges from "./pages/Badges";
import ScrollToTop from "./components/ScrollToTop";
import AISuggestions from "./pages/settings/AISuggestions";
import WeightGoal from "./pages/settings/WeightGoal";
import RingColors from "./pages/settings/RingColors";
import RequestFeature from "./pages/settings/RequestFeature";
import EditProfile from "./pages/settings/EditProfile";
import Snowfall from "./components/Snowfall";
import { useState, useEffect } from "react";
import useLocalStorage from "./hooks/useLocalStorage";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/diets" element={<Diets />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/exercise" element={<Exercise />} />
        <Route path="/badges" element={<Badges />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const AppRoutes = () => {
  const { session, profile, loading } = useAuth();
  const location = useLocation();
  const [snowEnabled, setSnowEnabled] = useLocalStorage<boolean>("calorel_snow_enabled", true);

  // Aseguramos un valor por defecto razonable si algo va mal leyendo localStorage
  useEffect(() => {
    if (snowEnabled === undefined || snowEnabled === null) {
      setSnowEnabled(true);
    }
  }, [snowEnabled, setSnowEnabled]);

  if (loading) {
    return <SplashScreen />;
  }

  const fullScreenRoutes = [
    "/scanner",
    "/barcode-result",
    "/exercise/running",
    "/exercise/weights",
    "/exercise/write",
    "/exercise/manual",
    "/settings/preferences",
    "/settings/nutritional-goals",
    "/settings/ai-suggestions",
    "/settings/weight-goal",
    "/settings/ring-colors",
    "/settings/request-feature",
    "/settings/edit-profile",
  ];

  // Contenedor base que existe tanto en claro como en oscuro
  const shellClass = "relative min-h-screen bg-background";

  if (fullScreenRoutes.includes(location.pathname)) {
    return (
      <div className={shellClass}>
        <Snowfall enabled={!!snowEnabled} />
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/scanner" element={<Scanner />} />
              <Route path="/barcode-result" element={<BarcodeResultPage />} />
              <Route path="/exercise/running" element={<Running />} />
              <Route path="/exercise/weights" element={<Weights />} />
              <Route path="/exercise/write" element={<WriteExercise />} />
              <Route path="/exercise/manual" element={<ManualExercise />} />
              <Route path="/settings/preferences" element={<Preferences />} />
              <Route path="/settings/nutritional-goals" element={<NutritionalGoals />} />
              <Route path="/settings/ai-suggestions" element={<AISuggestions />} />
              <Route path="/settings/weight-goal" element={<WeightGoal />} />
              <Route path="/settings/ring-colors" element={<RingColors />} />
              <Route path="/settings/request-feature" element={<RequestFeature />} />
              <Route path="/settings/edit-profile" element={<EditProfile />} />
            </Routes>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className={shellClass}>
        <Snowfall enabled={!!snowEnabled} />
        <div className="relative z-10">
          <Login />
        </div>
      </div>
    );
  }

  if (!profile?.onboarding_completed) {
    return (
      <div className={shellClass}>
        <Snowfall enabled={!!snowEnabled} />
        <div className="relative z-10">
          <Onboarding />
        </div>
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <Snowfall enabled={!!snowEnabled} />
      <div className="pb-28 relative z-10">
        <AnimatedRoutes />
      </div>
      <BottomNav />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AuthProvider>
            <NutritionProvider>
              <Toaster />
              <Sonner />
              <AppRoutes />
            </NutritionProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;