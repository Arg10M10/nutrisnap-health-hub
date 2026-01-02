import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Clock, Beef, Wheat, Droplets, Minus, Plus, ChevronDown } from "lucide-react";
import { Recipe } from "@/data/recipes";
import { AnalysisResult } from "@/components/FoodAnalysisCard";
import { useNutrition } from "@/context/NutritionContext";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

interface RecipeDetailDrawerProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}

const RecipeDetailDrawer = ({ recipe, isOpen, onClose }: RecipeDetailDrawerProps) => {
  const { t } = useTranslation();
  const [portions, setPortions] = useState(1);
  const { addAnalysis } = useNutrition();
  const navigate = useNavigate();

  if (!recipe) return null;

  const handlePortionChange = (change: number) => {
    setPortions(prev => Math.max(1, prev + change));
  };

  const currentCalories = recipe.calories * portions;
  const currentProtein = recipe.protein * portions;
  const currentCarbs = recipe.carbs * portions;
  const currentFats = recipe.fats * portions;

  const handleAddToLog = () => {
    const analysisResult: AnalysisResult = {
      foodName: t(`recipes.${recipe.id}.name` as any),
      calories: `${currentCalories} kcal`,
      protein: `${currentProtein}g`,
      carbs: `${currentCarbs}g`,
      fats: `${currentFats}g`,
      sugars: '0g', 
      fiber: '0g', 
      healthRating: 'Saludable', 
      reason: t('share.generated_with'),
      ingredients: recipe.ingredients.map(ing => t(`recipes.${recipe.id}.list.${ing.key}` as any)),
    };

    addAnalysis(analysisResult, recipe.image);
    onClose();
    navigate('/');
    toast.success(t('analysis.save_to_diary'));
  };

  const steps = t(`recipes.${recipe.id}.instructions` as any, { returnObjects: true }) as string[];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="w-screen h-screen max-w-none m-0 p-0 rounded-none border-none bg-black flex flex-col focus:outline-none z-50 [&>button]:hidden overflow-hidden"
      >
        <div className="sr-only">
          <DialogTitle>{t(`recipes.${recipe.id}.name` as any)}</DialogTitle>
        </div>

        {/* 1. IMAGEN DE FONDO (Fija/Parallax) */}
        <div className="absolute top-0 left-0 w-full h-[50vh] z-0">
          <img 
            src={recipe.image} 
            alt={t(`recipes.${recipe.id}.name` as any)} 
            className="w-full h-full object-cover" 
          />
          {/* Degradados para legibilidad */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
        </div>

        {/* 2. CONTENIDO DESPLAZABLE (Overlay) */}
        <div className="relative z-10 h-full w-full overflow-y-auto no-scrollbar">
          
          {/* Espaciador transparente para dejar ver la imagen arriba */}
          <div className="h-[40vh] w-full bg-transparent" onClick={onClose} />

          {/* Tarjeta de Contenido */}
          <div className="bg-background rounded-t-[32px] px-6 pb-32 min-h-[60vh] shadow-[0_-10px_40px_rgba(0,0,0,0.3)] border-t border-white/10 relative">
            
            {/* Indicador de arrastre visual */}
            <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full mx-auto mt-4 mb-6" />

            <div className="space-y-8">
              {/* Título & Tiempo */}
              <div>
                <h1 className="text-3xl font-bold text-foreground leading-tight mb-3">
                  {t(`recipes.${recipe.id}.name` as any)}
                </h1>
                <div className="flex items-center text-muted-foreground text-sm font-medium bg-muted/50 w-fit px-3 py-1.5 rounded-full">
                  <Clock className="w-4 h-4 mr-1.5" />
                  {recipe.time} {t('recipes.spaghetti_bolognese.minutes')} • {currentCalories} kcal
                </div>
              </div>

              {/* Macros */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/30 text-center flex flex-col items-center justify-center gap-1">
                  <Beef className="w-6 h-6 text-red-500 mb-1" />
                  <p className="font-bold text-xl text-foreground leading-none">{currentProtein}g</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t('share.prot_short')}</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/30 text-center flex flex-col items-center justify-center gap-1">
                  <Wheat className="w-6 h-6 text-orange-500 mb-1" />
                  <p className="font-bold text-xl text-foreground leading-none">{currentCarbs}g</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t('share.carb_short')}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 text-center flex flex-col items-center justify-center gap-1">
                  <Droplets className="w-6 h-6 text-blue-500 mb-1" />
                  <p className="font-bold text-xl text-foreground leading-none">{currentFats}g</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t('share.fat_short')}</p>
                </div>
              </div>

              {/* Ingredientes */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-xl">{t('recipes.spaghetti_bolognese.ingredients')}</h3>
                  
                  {/* Control de Porciones */}
                  <div className="flex items-center bg-muted rounded-full p-1 border border-border shadow-sm">
                    <button 
                      onClick={() => handlePortionChange(-1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-background shadow-sm text-foreground active:scale-90 transition-transform disabled:opacity-50"
                      disabled={portions <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-bold text-sm tabular-nums">{portions}</span>
                    <button 
                      onClick={() => handlePortionChange(1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-background shadow-sm text-foreground active:scale-90 transition-transform"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {recipe.ingredients.map((ing, idx) => {
                    const amount = ing.amount > 0 ? ing.amount * portions : null;
                    const amountDisplay = amount ? `${amount}${ing.unit ? ' ' + ing.unit : ''}` : t('recipes.spaghetti_bolognese.to_taste');
                    
                    return (
                      <div key={idx} className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
                        <span className="text-foreground font-medium">{t(`recipes.${recipe.id}.list.${ing.key}` as any)}</span>
                        <span className="font-semibold text-primary">{amountDisplay}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Instrucciones */}
              <div className="pb-8">
                <h3 className="font-bold text-xl mb-5">{t('recipes.spaghetti_bolognese.steps')}</h3>
                <div className="space-y-8 relative">
                  {/* Línea conectora */}
                  <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-border" />
                  
                  {steps.map((step, idx) => (
                    <div key={idx} className="flex gap-5 relative">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm shadow-md z-10 border-4 border-background">
                        {idx + 1}
                      </div>
                      <p className="text-muted-foreground leading-relaxed pt-0.5 text-base">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. BOTÓN DE CIERRE FLOTANTE (Arriba Izquierda) */}
        <div className="absolute top-0 left-0 p-4 pt-12 z-20">
          <Button 
            variant="secondary" 
            size="icon" 
            className="bg-black/20 text-white hover:bg-black/40 backdrop-blur-md rounded-full w-10 h-10 border border-white/10 shadow-lg transition-all active:scale-95" 
            onClick={onClose}
          >
            <ChevronDown className="w-6 h-6" />
          </Button>
        </div>

        {/* 4. BOTÓN "AGREGAR" FLOTANTE (Abajo) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/95 to-transparent pt-8 pb-8 z-20">
          <Button 
            size="lg" 
            className="w-full h-14 text-lg rounded-2xl shadow-xl shadow-primary/25 font-bold"
            onClick={handleAddToLog}
          >
            {t('recipes.spaghetti_bolognese.add_to_log')} ({currentCalories} kcal)
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default RecipeDetailDrawer;