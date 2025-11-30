import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NutritionProvider } from "./context/NutritionContext";

import Index from "./pages/Index";
import Scanner from "./pages/Scanner";
import Exercises from "./pages/Exercises";
import Progress from "./pages/Progress";
import Diets from "./pages/Diets";
import NotFound from "./pages/NotFound";
import AnalysisResultPage from "@/pages/AnalysisResult";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <NutritionProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/exercises" element={<Exercises />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/diets" element={<Diets />} />
            <Route path="/analysis-result" element={<AnalysisResultPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </NutritionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;