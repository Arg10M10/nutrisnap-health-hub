import { useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import FoodAnalysisCard, { AnalysisResult } from "@/components/FoodAnalysisCard";
import { FoodEntry, useNutrition } from "@/context/NutritionContext";
import { useTranslation } from "react-i18next";
import { Leaf, Loader2, Trash2, X, Utensils } from "lucide-react";
import { shareElement } from '@/lib/share';
import { DownloadIcon } from './icons/DownloadIcon';

interface AnalysisDetailDrawerProps {
  entry: FoodEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

const AnalysisDetailDrawer = ({ entry, isOpen, onClose }: AnalysisDetailDrawerProps) => {
  const { t } = useTranslation();
  const shareRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { deleteEntry } = useNutrition();

  if (!entry) return null;

  const ingredients = (entry.analysis_data as any)?.ingredients || [];

  const result: AnalysisResult = {
    foodName: entry.food_name,
    calories: entry.calories || '0 kcal',
    protein: entry.protein || '0g',
    carbs: entry.carbs || '0g',
    fats: entry.fats || '0g',
    sugars: entry.sugars || '0g',
    fiber: entry.fiber || '0g',
    healthRating: entry.health_rating || 'Moderado',
    reason: entry.reason || t('analysis.default_reason'),
    ingredients: ingredients,
  };

  const handleShare = async () => {
    if (!shareRef.current) return;
    setIsSharing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      await shareElement(
        shareRef.current,
        `meal-${entry.food_name.replace(/\s+/g, '-').toLowerCase()}`,
        'Calorel Meal',
        t('share.meal_message', { food: entry.food_name })
      );
    } catch (error) {
      console.error('Error sharing meal:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleDelete = () => {
    deleteEntry(entry.id, 'food');
    setIsDeleteOpen(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent 
          className="w-screen h-screen max-w-none m-0 p-0 rounded-none border-none bg-background flex flex-col focus:outline-none z-50 [&>button]:hidden"
        >
          <div className="sr-only">
            <DialogTitle>{t('analysis.details_title')}</DialogTitle>
          </div>

          <div className="relative flex-1 overflow-y-auto no-scrollbar">
            <div className="relative w-full h-[45vh] min-h-[350px]">
              {entry.image_url ? (
                <img 
                  src={entry.image_url} 
                  alt={entry.food_name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-muted/50 flex flex-col items-center justify-center text-muted-foreground/30">
                  <Utensils className="w-32 h-32 mb-2" strokeWidth={1} />
                </div>
              )}
              
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />

              <div className="absolute top-0 left-0 right-0 p-4 pt-12 flex justify-between items-start z-10">
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="bg-black/30 text-white hover:bg-black/50 backdrop-blur-md rounded-full w-12 h-12 border border-white/10 shadow-lg" 
                  onClick={onClose}
                >
                  <X className="w-6 h-6" />
                </Button>

                <div className="flex gap-3">
                  <Drawer open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <DrawerTrigger asChild>
                      <Button 
                        variant="secondary" 
                        size="icon" 
                        className="bg-black/30 text-white hover:bg-red-500/80 hover:text-white hover:border-red-500/50 backdrop-blur-md rounded-full w-12 h-12 border border-white/10 shadow-lg transition-colors"
                      >
                        <Trash2 className="w-6 h-6" />
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent className="z-[60]">
                      <div className="mx-auto w-full max-w-sm">
                        <DrawerHeader>
                          <DrawerTitle className="text-center text-xl font-bold">¿Eliminar comida?</DrawerTitle>
                          <DrawerDescription className="text-center text-base mt-2">
                            Esta acción no se puede deshacer. Se eliminará este registro de tu diario.
                          </DrawerDescription>
                        </DrawerHeader>
                        <DrawerFooter className="gap-3 pb-8">
                          <Button 
                            onClick={handleDelete} 
                            size="lg"
                            variant="destructive" 
                            className="w-full h-14 text-lg rounded-2xl shadow-lg shadow-red-500/20"
                          >
                            Eliminar
                          </Button>
                          <DrawerClose asChild>
                            <Button variant="outline" size="lg" className="w-full h-14 text-lg rounded-2xl">
                              Cancelar
                            </Button>
                          </DrawerClose>
                        </DrawerFooter>
                      </div>
                    </DrawerContent>
                  </Drawer>

                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="bg-black/30 text-white hover:bg-black/50 backdrop-blur-md rounded-full w-12 h-12 border border-white/10 shadow-lg"
                    onClick={handleShare}
                    disabled={isSharing}
                  >
                    {isSharing ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <DownloadIcon width={24} height={24} strokeWidth={2} />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="relative -mt-10 bg-background rounded-t-[32px] px-6 pb-12 min-h-[60vh] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
              <div className="pt-8" />
              <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700 fade-in-0">
                <FoodAnalysisCard result={result} />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div 
        ref={shareRef}
        className="fixed top-0 w-[400px] bg-white p-0 z-[-1] overflow-hidden"
        style={{ left: '-9999px' }}
      >
        <div className="bg-green-50 p-6 flex items-center justify-center gap-3 border-b border-green-100">
          <div className="bg-green-600 p-2 rounded-full">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-normal text-green-700">Calorel</h1>
        </div>

        <div className="w-full h-[300px] relative bg-gray-100 flex items-center justify-center">
          {entry.image_url ? (
            <img 
              src={entry.image_url} 
              alt={entry.food_name} 
              className="w-full h-full object-cover"
              crossOrigin="anonymous" 
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-300">
                <Utensils className="w-24 h-24" />
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 pt-12">
            <h2 className="text-white text-2xl font-bold drop-shadow-md">{entry.food_name}</h2>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnalysisDetailDrawer;