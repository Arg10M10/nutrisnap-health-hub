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

// Inicialización global de GoogleAuth (solo para web/PWA)
if (!Capacitor.isNativePlatform()) {
  GoogleAuth.initialize({
    clientId: '733617800360-gdfv4o8j13anns76lj1hmf64deeuo8iq.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
    grantOfflineAccess: true,
  });
}

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

  // Eliminamos el useEffect de inicialización de GoogleAuth de aquí.

  if (authLoading) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-background">
        <SplashScreen />
      </div>
    );
  }

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
  if (!profile || !profile.onboarding_completed) {
    return (
      <div className={shellClass}>
        <div className="relative z-10">
          <Onboarding />
        </div>
      </div>
    );
  }

  // 3. Logged in, Onboarded, but NOT Subscribed
  // This is the STRICT PAYWALL. If false, users CANNOT access the app.
  if (!profile.is_subscribed) {
    return (
      <div className={shellClass}>
        <div className="relative z-10">
          <Subscribe />
        </div>
      </div>
    );
  }

  // 4. Authenticated, Onboarded & Subscribed -> Full App access
  
  // Generating Plan Screen (Special case, used right after subscribing)
  if (location.pathname === '/generating-plan') {
     return (
      <div className={shellClass}>
        <div className="relative z-10">
          <GeneratingPlan />
        </div>
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
        <OrientationLock />
        <BrowserRouter>
          <ScrollToTop />
          <AuthProvider>
            <NutritionProvider>
              <Toaster />
              <Sonner position="top-center" duration={3000} />
              <AppRoutes />
            </NutritionProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;