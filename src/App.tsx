import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import AuthGuard from "./components/AuthGuard";
import PageLayout from "./components/PageLayout";
import Index from "./pages/Index";
import Scanner from "./pages/Scanner";
import Exercises from "./pages/Exercises";
import Missions from "./pages/Missions";
import Diets from "./pages/Diets";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => (
  <PageLayout>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/scanner" element={<Scanner />} />
      <Route path="/exercises" element={<Exercises />} />
      <Route path="/missions" element={<Missions />} />
      <Route path="/diets" element={<Diets />} />
    </Routes>
  </PageLayout>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route element={<AuthGuard />}>
              <Route path="/*" element={<AppRoutes />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;