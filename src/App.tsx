import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { NutritionProvider, useNutrition } from "./context/NutritionContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AILimitProvider } from "./context/AILimitContext";
import { ThemeProvider } from "./components/ThemeProvider";
import { StatusBarSync } from "./components/StatusBarSync";
import OrientationLock from "./components/OrientationLock";

import Index from "./pages/Index";
import Scanner from "./pages/Scanner";
import Progress from "./pages/Progress";
import Diets from "./pages/Diets";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Configuration from "./pages/Configuration";
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
import Reminders from "./pages/settings/Reminders";
import BadgeDetailModal from "./components/BadgeDetailModal";
import Subscribe from "./pages/Subscribe";
import GeneratingPlan from "./pages/onboarding/GeneratingPlan";
import GoalProjection from "./pages/onboarding/GoalProjection";
import Recipes from "./pages/Recipes";
import RegisterForPremium from "./pages/RegisterForPremium";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import Water from "./pages/Water"; 
import { Loader2 } from "lucide-react";
import { Button } from "./components/ui/button";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/diets" element={<Diets />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/exercise" element={<Exercise />} />
        <Route path="/water" element={<Water />} /> 
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
  const { profile, user, loading: authLoading, signOut } = useAuth();
  const location = useLocation();
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  if (authLoading || isSplashVisible) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-background">
        <SplashScreen />
      </div>
    );
  }

  const shellClass = "relative min-h-screen"; 

  // ESTADO INTERMEDIO: Usuario autenticado pero perfil cargando
  // Esto evita redirigir al login si la red está lenta al cargar el perfil
  if (user && !profile) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
         <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
         <p className="text-muted-foreground animate-pulse mb-6">Sincronizando tus datos...</p>
         
         <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
                signOut().then(() => window.location.reload());
            }}
            className="text-xs border-dashed text-muted-foreground hover:text-destructive"
         >
            ¿Tarda demasiado? Reiniciar Sesión
         </Button>
      </div>
    );
  }

  // FLUJO DE USUARIO NO AUTENTICADO / SIN PERFIL
  if (!profile) {
    return (
      <div className={shellClass}>
        <div className="relative z-10">
          <Routes>
             <Route path="/onboarding" element={<Onboarding />} />
             <Route path="*" element={<Login />} /> 
          </Routes>
        </div>
      </div>
    );
  }

  if (profile && !profile.onboarding_completed) {
    return (
      <div className={shellClass}>
        <div className="relative z-10">
          <Onboarding />
        </div>
      </div>
    );
  }

  const onboardingRoutes = ['/generating-plan', '/goal-projection', '/subscribe', '/register-premium', '/subscription-success'];
  
  if (onboardingRoutes.includes(location.pathname)) {
     return (
      <div className={shellClass}>
        <div className="relative z-10">
          <Routes location={location}>
             <Route path="/subscribe" element={<Subscribe />} />
             <Route path="/register-premium" element={<RegisterForPremium />} />
             <Route path="/generating-plan" element={<GeneratingPlan />} />
             <Route path="/goal-projection" element={<GoalProjection />} />
             <Route path="/subscription-success" element={<SubscriptionSuccess />} />
          </Routes>
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
    "/configuration",
    "/settings/preferences",
    "/settings/nutritional-goals",
    "/settings/ai-suggestions",
    "/settings/weight-goal",
    "/settings/ring-colors",
    "/settings/request-feature",
    "/settings/edit-profile",
    "/settings/personal-details",
    "/settings/reminders",
    "/recipes",
    "/login",
    "/water" 
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
              <Route path="/configuration" element={<Configuration />} />
              <Route path="/settings/preferences" element={<Preferences />} />
              <Route path="/settings/nutritional-goals" element={<NutritionalGoals />} />
              <Route path="/settings/ai-suggestions" element={<AISuggestions />} />
              <Route path="/settings/weight-goal" element={<WeightGoal />} />
              <Route path="/settings/ring-colors" element={<RingColors />} />
              <Route path="/settings/request-feature" element={<RequestFeature />} />
              <Route path="/settings/edit-profile" element={<EditProfile />} />
              <Route path="/settings/personal-details" element={<PersonalDetails />} />
              <Route path="/settings/reminders" element={<Reminders />} />
              <Route path="/recipes" element={<Recipes />} />
              <Route path="/login" element={<Login />} />
              <Route path="/water" element={<Water />} />
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
            <AILimitProvider>
              <NutritionProvider>
                <Toaster />
                <Sonner position="top-center" duration={3000} />
                <AppRoutes />
              </NutritionProvider>
            </AILimitProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;