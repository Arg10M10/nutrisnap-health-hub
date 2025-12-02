import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NutritionProvider } from "./context/NutritionContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Index from "./pages/Index";
import Scanner from "./pages/Scanner";
import Exercises from "./pages/Exercises";
import Progress from "./pages/Progress";
import Diets from "./pages/Diets";
import NotFound from "./pages/NotFound";
import BarcodeResultPage from "@/pages/BarcodeResult";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Onboarding from "./pages/onboarding/Onboarding";
import SplashScreen from "./pages/SplashScreen";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  if (!session) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  if (!profile?.onboarding_completed) {
    return (
      <Routes>
        <Route path="*" element={<Onboarding />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/scanner" element={<Scanner />} />
      <Route path="/exercises" element={<Exercises />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="/diets" element={<Diets />} />
      <Route path="/barcode-result" element={<BarcodeResultPage />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <NutritionProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </NutritionProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;