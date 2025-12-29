import { useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FoodAnalysisCard, { AnalysisResult } from "@/components/FoodAnalysisCard";
import { FoodEntry, useNutrition } from "@/context/NutritionContext";
import { useTranslation } from "react-i18next";
import { Leaf, Loader2, Flame, Beef, Wheat, Droplets, Trash2, AlertTriangle, X } from "lucide-react";
import { shareElement } from '@/lib/share';
import { DownloadIcon } from './icons/DownloadIcon';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

  // Extraer ingredientes de analysis_data si existe
  const ingredients = (entry.analysis_data as any)?.ingredients || [];

  const result: AnalysisResult = {
    foodName: entry.food_name,
    calories: entry.calories || '0 kcal',
    protein: entry.protein || '0g',
    carbs: entry.carbs || '0g',
    fats: entry.fats || '0g',
    sugars: entry.sugars || '0g',
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
      {/* Vista de Detalle en Pantalla Completa usando Dialog */}
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent 
          className="w-screen h-screen max-w-none m-0 p-0 rounded-none border-none bg-background flex flex-col focus:outline-none z-50 [&>button]:hidden"
        >
          {/* Título oculto para accesibilidad */}
          <div className="sr-only">
            <DialogTitle>{t('analysis.details_title')}</DialogTitle>
          </div>

          <div className="relative flex-1 overflow-y-auto no-scrollbar">
            {/* Sección de Imagen (Header) Inmersiva */}
            <div className="relative w-full h-[45vh] min-h-[350px]">
              {entry.image_url ? (
                <img 
                  src={entry.image_url} 
                  alt={entry.food_name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                  No Image
                </div>
              )}
              
              {/* Degradado superior para legibilidad de botones */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
              
              {/* Degradado inferior para transición suave al contenido */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />

              {/* Botones de Acción Superpuestos - Barra Superior */}
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
                  <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="secondary" 
                        size="icon" 
                        className="bg-black/30 text-white hover:bg-red-500/80 hover:text-white hover:border-red-500/50 backdrop-blur-md rounded-full w-12 h-12 border border-white/10 shadow-lg transition-colors"
                      >
                        <Trash2 className="w-6 h-6" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar comida?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Se eliminará este registro de tu diario.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

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

            {/* Contenido Nutricional (Deslizable hacia arriba sobre la imagen) */}
            <div className="relative -mt-10 bg-background rounded-t-[32px] px-6 pb-12 min-h-[60vh] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
              {/* Espaciador superior */}
              <div className="pt-8" />
              
              <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700 fade-in-0">
                <FoodAnalysisCard result={result} />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Plantilla oculta para compartir */}
      <div 
        ref={shareRef}
        className="fixed top-0 w-[400px] bg-white p-0 z-[-1] overflow-hidden"
        style={{ left: '-9999px' }}
      >
        <div className="bg-green-50 p-6 flex items-center justify-center gap-3 border-b border-green-100">
          <div className="bg-green-600 p-2 rounded-full">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-green-700">Calorel</h1>
        </div>

        <div className="w-full h-[300px] relative bg-white">
          {entry.image_url ? (
            <img 
              src={entry.image_url} 
              alt={entry.food_name} 
              className="w-full h-full object-cover"
              crossOrigin="anonymous" 
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 pt-12">
            <h2 className="text-white text-2xl font-bold drop-shadow-md">{entry.food_name}</h2>
          </div>
        </div>

        <div className="p-6 bg-white">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-xl">
              <Flame className="w-6 h-6 text-orange-500 mb-1" />
              <span className="font-bold text-gray-800 text-sm">{entry.calories_value || 0}</span>
              <span className="text-xs text-gray-500">kcal</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-xl">
              <Beef className="w-6 h-6 text-red-500 mb-1" />
              <span className="font-bold text-gray-800 text-sm">{entry.protein_value || 0}g</span>
              <span className="text-xs text-gray-500">{t('share.prot_short')}</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-xl">
              <Wheat className="w-6 h-6 text-yellow-500 mb-1" />
              <span className="font-bold text-gray-800 text-sm">{entry.carbs_value || 0}g</span>
              <span className="text-xs text-gray-500">{t('share.carb_short')}</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-xl">
              <Droplets className="w-6 h-6 text-blue-500 mb-1" />
              <span className="font-bold text-gray-800 text-sm">{entry.fats_value || 0}g</span>
              <span className="text-xs text-gray-500">{t('share.fat_short')}</span>
            </div>
          </div>
          
          <div className="mt-6 text-center">
             <p className="text-sm text-gray-400">{t('share.generated_with')}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnalysisDetailDrawer;