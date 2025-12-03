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
import Login from "./pages/Login";
import Onboarding from "./pages/onboarding/Onboarding";
import SplashScreen from "./pages/SplashScreen";
import Exercise from "./pages/Exercise";
import Running from "./pages/exercise/Running";
import BottomNav from "./components/BottomNav";
import Badges from "./pages/Badges";
import ScrollToTop from "./components/ScrollToTop";

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
        <Route path="/settings/preferences" element={<Preferences />} />
        <Route path="/exercise" element={<Exercise />} />
        <Route path="/badges" element={<Badges />} />
        {/* Rutas sin BottomNav se manejan fuera de este componente principal */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const AppRoutes = () => {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <SplashScreen />;
  }

  // Rutas de pantalla completa que no usan el layout principal
  const fullScreenRoutes = {
    "/scanner": <Scanner />,
    "/barcode-result": <BarcodeResultPage />,
    "/exercise/running": <Running />,
  };

  if (fullScreenRoutes[location.pathname]) {
    return (
       <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/barcode-result" element={<BarcodeResultPage />} />
          <Route path="/exercise/running" element={<Running />} />
        </Routes>
      </AnimatePresence>
    );
  }

  if (!session) {
    return <Login />;
  }

  if (!profile?.onboarding_completed) {
    return <Onboarding />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pb-28">
        <AnimatedRoutes />
      </div>
      <BottomNav />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
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