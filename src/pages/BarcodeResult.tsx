import { useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusCircle, Scan, SearchX } from "lucide-react";
import { useNutrition } from "@/context/NutritionContext";
import { toast } from "sonner";
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import ManualFoodEntry from '@/components/ManualFoodEntry';
import BarcodeAnalysisCard from '@/components/BarcodeAnalysisCard';

const BarcodeResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addAnalysis } = useNutrition();
  const { barcode } = (location.state || {}) as { barcode: string };

  const { data: productData, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['openfoodfacts', barcode],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-openfoodfacts', {
        body: { barcode },
      });
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!barcode,
    retry: false,
  });

  const { mutate: getRating, data: ratingData, isPending: isRatingPending } = useMutation({
    mutationFn: async (details: { name: string; nutrients: any }) => {
      const { data, error } = await supabase.functions.invoke('rate-food-product', {
        body: details,
      });
      if (error) throw new Error(error.message);
      return data;
    },
  });

  useEffect(() => {
    if (productData?.found) {
      getRating({ name: productData.name, nutrients: productData.nutrients });
    }
  }, [productData, getRating]);

  if (!barcode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h1 className="text-2xl mb-4">No se proporcionó ningún código de barras.</h1>
        <Button onClick={() => navigate("/scanner")}>
          <Scan className="mr-2 w-5 h-5" /> Volver al Escáner
        </Button>
      </div>
    );
  }

  const handleAddToDiary = () => {
    if (!productData || !ratingData) {
      toast.error("Aún se están cargando los datos del producto.");
      return;
    }
    const result = {
      foodName: productData.name,
      calories: `${productData.nutrients.calories.toFixed(0)} kcal`,
      protein: `${productData.nutrients.protein.toFixed(1)}g`,
      carbs: `${productData.nutrients.carbs.toFixed(1)}g`,
      fats: `${productData.nutrients.fats.toFixed(1)}g`,
      healthRating: ratingData.healthRating,
      reason: ratingData.reason,
    };
    addAnalysis(result, productData.imageUrl);
    navigate("/");
  };

  const renderContent = () => {
    if (isLoadingProduct) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-4 space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Buscando producto...</p>
        </div>
      );
    }

    if (!productData?.found) {
      return (
        <div className="space-y-6">
          <Card className="p-8 text-center">
            <SearchX className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-2xl font-semibold text-foreground">Producto no encontrado</h2>
            <p className="text-muted-foreground">
              Este código de barras no está en nuestra base de datos. Puedes añadirlo manualmente para que la IA lo analice.
            </p>
          </Card>
          <ManualFoodEntry />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <BarcodeAnalysisCard
          name={productData.name}
          brands={productData.brands}
          imageUrl={productData.imageUrl}
          servingSize={productData.servingSize}
          nutrients={productData.nutrients}
          rating={ratingData}
          isRatingLoading={isRatingPending}
        />
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={() => navigate('/scanner')} variant="outline" size="lg" className="h-14 text-base">
            <Scan className="mr-2 w-5 h-5" /> Escanear Otro
          </Button>
          <Button onClick={handleAddToDiary} size="lg" className="h-14 text-base" disabled={!ratingData}>
            {isRatingPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 w-5 h-5" />}
            Añadir al Diario
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate('/scanner')} className="rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold text-primary">Resultado del Escaneo</h1>
      </header>
      <main className="flex-grow p-4 pb-24">
        {renderContent()}
      </main>
    </div>
  );
};

export default BarcodeResultPage;