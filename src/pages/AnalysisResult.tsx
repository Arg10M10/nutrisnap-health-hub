import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import FoodAnalysisCard, { AnalysisResult } from "@/components/FoodAnalysisCard";
import { ArrowLeft, PlusCircle, Scan } from "lucide-react";
import { useNutrition } from "@/context/NutritionContext";

const AnalysisResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addAnalysis } = useNutrition();

  const { result, image } = (location.state || {}) as { result: AnalysisResult; image: string };

  if (!result || !image) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h1 className="text-2xl mb-4">No se encontraron resultados de análisis.</h1>
        <p className="text-muted-foreground mb-6">Por favor, vuelve a escanear una imagen.</p>
        <Button onClick={() => navigate("/scanner")}>
          <Scan className="mr-2 w-5 h-5" /> Volver al Escáner
        </Button>
      </div>
    );
  }

  const handleAddToDiary = () => {
    addAnalysis(result, image);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        <img src={image} alt="Comida analizada" className="w-full h-64 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/scanner')}
          className="absolute top-4 left-4 rounded-full bg-black/50 hover:bg-black/70 w-10 h-10 text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
      </div>

      <div className="p-4 -mt-16 space-y-6">
        <FoodAnalysisCard result={result} />
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={() => navigate('/scanner')} variant="outline" size="lg" className="h-14 text-base">
            <Scan className="mr-2 w-5 h-5" /> Escanear Otro
          </Button>
          <Button onClick={handleAddToDiary} size="lg" className="h-14 text-base">
            <PlusCircle className="mr-2 w-5 h-5" /> Añadir al Diario
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResultPage;