import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { SessionProvider, useSession } from "./contexts/SessionContext";

import Index from "./pages/Index";
import Scanner from "./pages/Scanner";
import Exercises from "./pages/Exercises";
import Missions from "./pages/Missions";
import Diets from "./pages/Diets";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import SplashScreen from "./components/SplashScreen";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SessionProvider>
          <AppContent />
        </SessionProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

const AppContent = () => {
  const { session, loading } = useSession();
  const location = useLocation();

  if (loading) {
    return <SplashScreen />;
  }

  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" state={{ from: location }} replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/scanner" element={<Scanner />} />
      <Route path="/exercises" element={<Exercises />} />
      <Route path="/missions" element={<Missions />} />
      <Route path="/diets" element={<Diets />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;