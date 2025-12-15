import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';
import { NutritionProvider, useNutrition } from "./context/NutritionContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./components/ThemeProvider";
import { StatusBarSync } from "./components/StatusBarSync";
import { useTranslation } from "react-i18next";

import Index from "./pages/Index";
import Scanner from "./pages/Scanner";
import Progress from "./pages/Progress";
import Diets from "./pages/Diets";
import NotFound from "./pages/NotFound";
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
import PersonalDetails from "./pages/settings/PersonalDetails";
import BadgeDetailModal from "./components/BadgeDetailModal";
import Subscribe from "./pages/Subscribe";
import { Button } from "./components/ui/button";
import { RefreshCw } from "lucide-react";

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

const GlobalBadgeModal = () => {
  const { unlockedBadge, closeBadgeModal } = useNutrition();
  return (
    <BadgeDetailModal 
      isOpen={!!unlockedBadge} 
      onClose={closeBadgeModal} 
      badge={unlockedBadge} 
    />
  );
};

const AppRoutes = () => {
  const { session, profile, loading: authLoading, signOut, refetchProfile } = useAuth();
  const location = useLocation();
  const [isLongLoading, setIsLongLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (authLoading || (session && !profile)) {
      // Reducido a 2.5 segundos para que el usuario no espere tanto si falla
      timer = setTimeout(() => setIsLongLoading(true), 2500);
    } else {
      setIsLongLoading(false);
    }
    return () => clearTimeout(timer);
  }, [authLoading, session, profile]);

  // Initialize Google Auth
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      GoogleAuth.initialize({
        clientId: '522700969452-gof3re6i21fc0eotfbk4q496ke3gdl0k.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
    }
  }, []);

  const handleRetry = async () => {
    setIsLongLoading(false);
    await refetchProfile();
  };

  // 1. Loading state (Authenticating or Fetching Profile)
  if (authLoading || (session && !profile)) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-background">
        <SplashScreen />
        {isLongLoading && (
          <div className="absolute bottom-10 flex flex-col items-center gap-4 animate-fade-in px-4 text-center">
            <p className="text-muted-foreground text-sm">{t('common.taking_too_long')}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRetry} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                {t('common.retry')}
              </Button>
              <Button variant="ghost" onClick={signOut}>
                {t('common.sign_out')}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const fullScreenRoutes = [
    "/scanner",
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
    "/settings/personal-details",
    "/subscribe",
  ];

  const shellClass = "relative min-h-screen"; 

  // 2. No session -> Login
  if (!session) {
    return (
      <div className={shellClass}>
        <div className="relative z-10">
          <Login />
        </div>
      </div>
    );
  }

  // 3. New User -> Onboarding
  if (profile && !profile.onboarding_completed) {
    return (
      <div className={shellClass}>
        <div className="relative z-10">
          <Onboarding />
        </div>
      </div>
    );
  }

  // 4. Authenticated & Onboarded -> App
  if (fullScreenRoutes.includes(location.pathname)) {
    return (
      <div className={shellClass}>
        <GlobalBadgeModal />
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/scanner" element={<Scanner />} />
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
              <Route path="/settings/personal-details" element={<PersonalDetails />} />
              <Route path="/subscribe" element={<Subscribe />} />
            </Routes>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <GlobalBadgeModal />
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
        <StatusBarSync />
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