import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Clock, Beef, Wheat, Droplets, Minus, Plus, ChevronDown, Heart, ThumbsUp } from "lucide-react";
import { Recipe } from "@/data/recipes";
import { AnalysisResult } from "@/components/FoodAnalysisCard";
import { useNutrition } from "@/context/NutritionContext";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import AnimatedNumber from '../AnimatedNumber';

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
  const { user } = useAuth();
  const queryClient = useQueryClient();

  if (!recipe) return null;

  // Obtener conteo total de likes reales
  const { data: likeCount = 0 } = useQuery({
    queryKey: ['recipe_likes_count', recipe.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('recipe_likes')
        .select('*', { count: 'exact', head: true })
        .eq('recipe_id', recipe.id);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: isOpen, // Solo cargar cuando está abierto
  });

  // Verificar si el usuario actual dio like
  const { data: isLiked = false } = useQuery({
    queryKey: ['recipe_user_like', recipe.id, user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase
        .from('recipe_likes')
        .select('user_id')
        .eq('recipe_id', recipe.id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    },
    enabled: isOpen && !!user,
  });

  // Mutación para alternar like
  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Debes iniciar sesión para dar like");

      if (isLiked) {
        const { error } = await supabase
          .from('recipe_likes')
          .delete()
          .eq('recipe_id', recipe.id)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('recipe_likes')
          .insert({ recipe_id: recipe.id, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipe_likes_count', recipe.id] });
      queryClient.invalidateQueries({ queryKey: ['recipe_user_like', recipe.id] });
      
      if (!isLiked) {
        toast.success(t('recipes.liked_text'));
      }
    },
    onError: (error) => {
      if (error.message === "Debes iniciar sesión para dar like") {
        toast.error("Regístrate o inicia sesión para recomendar recetas.");
      } else {
        toast.error(t('common.error_friendly'));
      }
    }
  });

  const handleToggleLike = () => {
    toggleLikeMutation.mutate();
  };

  const handlePortionChange = (change: number) => {
    setPortions(prev => Math.max(1, prev + change));
  };

  const currentCalories = recipe.calories * portions;
  const currentProtein = recipe.protein * portions;
  const currentCarbs = recipe.carbs * portions;
  const currentFats = recipe.fats * portions;
  const currentSugars = recipe.sugars * portions;
  const currentFiber = recipe.fiber * portions;

  const handleAddToLog = () => {
    const analysisResult: AnalysisResult = {
      foodName: t(`recipes.${recipe.id}.name` as any),
      calories: `${currentCalories} kcal`,
      protein: `${currentProtein}g`,
      carbs: `${currentCarbs}g`,
      fats: `${currentFats}g`,
      sugars: `${currentSugars}g`,
      fiber: `${currentFiber}g`,
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
        className="w-screen h-screen max-w-none m-0 p-0 rounded-none border-none bg-background flex flex-col focus:outline-none z-50 [&>button]:hidden"
      >
        <div className="sr-only">
          <DialogTitle>{t(`recipes.${recipe.id}.name` as any)}</DialogTitle>
        </div>

        <div className="relative flex-1 overflow-y-auto no-scrollbar pb-24">
          {/* Header Image */}
          <div className="relative w-full h-[40vh] min-h-[300px]">
            <img 
              src={recipe.image} 
              alt={t(`recipes.${recipe.id}.name` as any)} 
              className="w-full h-full object-cover" 
            />
            
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
            
            <div className="absolute top-0 left-0 right-0 p-4 pt-12 flex justify-between items-start z-10">
              <Button 
                variant="secondary" 
                size="icon" 
                className="bg-black/30 text-white hover:bg-black/50 backdrop-blur-md rounded-full w-10 h-10 border border-white/10 shadow-lg" 
                onClick={onClose}
              >
                <ChevronDown className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Content Body */}
          <div className="relative -mt-10 bg-background rounded-t-[32px] px-6 min-h-[60vh] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
            <div className="pt-8 space-y-6">
              
              {/* Title & Time */}
              <div>
                <h1 className="text-2xl font-bold text-foreground leading-tight mb-2">
                  {t(`recipes.${recipe.id}.name` as any)}
                </h1>
                <div className="flex items-center text-muted-foreground text-sm font-medium">
                  <Clock className="w-4 h-4 mr-1.5" />
                  {recipe.time} {t('recipes.spaghetti_bolognese.minutes')} • {currentCalories} kcal
                </div>
              </div>

              {/* Macros */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100 dark:border-red-900/30 text-center">
                  <Beef className="w-5 h-5 text-red-500 mx-auto mb-1" />
                  <p className="font-bold text-foreground">{currentProtein}g</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">{t('share.prot_short')}</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/10 p-3 rounded-xl border border-orange-100 dark:border-orange-900/30 text-center">
                  <Wheat className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                  <p className="font-bold text-foreground">{currentCarbs}g</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">{t('share.carb_short')}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30 text-center">
                  <Droplets className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <p className="font-bold text-foreground">{currentFats}g</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">{t('share.fat_short')}</p>
                </div>
              </div>

              {/* Feedback / Like Section (Real Data) */}
              <div 
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border transition-all duration-300",
                  isLiked 
                    ? "bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30" 
                    : "bg-muted/30 border-transparent hover:bg-muted/50"
                )}
              >
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {isLiked ? t('recipes.liked_text') : t('recipes.like_question')}
                    </span>
                  </div>
                  {likeCount > 0 && (
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                      <ThumbsUp className="w-3 h-3" />
                      <span>{t('recipes.like_count', { count: likeCount })}</span>
                    </div>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleToggleLike}
                  disabled={toggleLikeMutation.isPending}
                  className={cn(
                    "rounded-full w-10 h-10 transition-all hover:bg-background/50",
                    isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-400"
                  )}
                >
                  <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
                </Button>
              </div>

              {/* Ingredients */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">{t('recipes.spaghetti_bolognese.ingredients')}</h3>
                  
                  {/* Portion Control */}
                  <div className="flex items-center bg-muted rounded-full p-1 border border-border">
                    <button 
                      onClick={() => handlePortionChange(-1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-background shadow-sm text-foreground active:scale-90 transition-transform"
                      disabled={portions <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-sm tabular-nums">{portions}</span>
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
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                        <span className="text-foreground/90">{t(`recipes.${recipe.id}.list.${ing.key}` as any)}</span>
                        <span className="font-semibold text-primary">{amountDisplay}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Instructions */}
              <div className="pb-8">
                <h3 className="font-bold text-lg mb-4">{t('recipes.spaghetti_bolognese.steps')}</h3>
                <div className="space-y-6">
                  {steps.map((step, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                        {idx + 1}
                      </div>
                      <p className="text-muted-foreground leading-relaxed pt-1">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Sticky Footer Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-10 pb-8 z-20">
          <Button 
            size="lg" 
            className="w-full h-14 text-lg rounded-2xl shadow-xl shadow-primary/25"
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