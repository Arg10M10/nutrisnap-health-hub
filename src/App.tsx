import { useEffect } from "react";
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
import OrientationLock from "./components/OrientationLock";

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
import GeneratingPlan from "./pages/onboarding/GeneratingPlan";

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
  const { session, profile, loading: authLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      GoogleAuth.initialize({
        clientId: '522700969452-gof3re6i21fc0eotfbk4q496ke3gdl0k.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
    }
  }, []);

  if (authLoading) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-background">
        <SplashScreen />
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
    "/generating-plan",
  ];

  const shellClass = "relative min-h-screen"; 

  // 1. Not logged in
  if (!session) {
    return (
      <div className={shellClass}>
        <div className="relative z-10">
          <Login />
        </div>
      </div>
    );
  }

  // 2. Logged in but Profile not ready OR Onboarding not completed
  // If profile is null, it might be loading or missing row. We send to Onboarding to create/fix it.
  if (!profile || !profile.onboarding_completed) {
    return (
      <div className={shellClass}>
        <div className="relative z-10">
          <Onboarding />
        </div>
      </div>
    );
  }

  // 3. Authenticated & Onboarded -> App
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
              <Route path="/generating-plan" element={<GeneratingPlan />} />
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
        <OrientationLock />
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