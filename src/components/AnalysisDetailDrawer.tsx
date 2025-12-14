import { useRef, useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import FoodAnalysisCard, { AnalysisResult } from "@/components/FoodAnalysisCard";
import { FoodEntry } from "@/context/NutritionContext";
import { useTranslation } from "react-i18next";
import { Share2, Leaf, Loader2, Flame, Beef, Wheat, Droplets } from "lucide-react";
import { shareElement } from '@/lib/share';

interface AnalysisDetailDrawerProps {
  entry: FoodEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

const AnalysisDetailDrawer = ({ entry, isOpen, onClose }: AnalysisDetailDrawerProps) => {
  const { t } = useTranslation();
  const shareRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);

  if (!entry) return null;

  const result: AnalysisResult = {
    foodName: entry.food_name,
    calories: entry.calories || '0 kcal',
    protein: entry.protein || '0g',
    carbs: entry.carbs || '0g',
    fats: entry.fats || '0g',
    sugars: entry.sugars || '0g',
    healthRating: entry.health_rating || 'Moderado',
    reason: entry.reason || t('analysis.default_reason'),
  };

  const handleShare = async () => {
    if (!shareRef.current) return;
    setIsSharing(true);
    try {
      // Pequeño delay para asegurar que la imagen (si se acaba de montar) tenga oportunidad de cargar
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await shareElement(
        shareRef.current,
        `meal-${entry.food_name.replace(/\s+/g, '-').toLowerCase()}`,
        'Calorel Meal',
        `Mira lo que estoy comiendo: ${entry.food_name} 🥗 - vía Calorel`
      );
    } catch (error) {
      console.error('Error sharing meal:', error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <>
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="max-h-[90vh] flex flex-col">
          <DrawerHeader className="relative">
              <DrawerTitle className="text-center">{t('analysis.details_title')}</DrawerTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-4 top-2 text-primary"
                onClick={handleShare}
                disabled={isSharing}
              >
                {isSharing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5" />}
              </Button>
          </DrawerHeader>
          <div data-vaul-scrollable className="overflow-y-auto flex-1 p-4 space-y-4">
              {entry.image_url && <img src={entry.image_url} alt={entry.food_name} className="w-full h-48 object-cover rounded-lg" />}
              <FoodAnalysisCard result={result} />
          </div>
          <DrawerFooter className="pt-4 border-t flex-shrink-0">
            <Button onClick={onClose} size="lg">{t('analysis.close')}</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Plantilla oculta para compartir comida - MOVIDA FUERA DEL DRAWER */}
      {/* Usamos 'left: -9999px' en lugar de transform para mejor compatibilidad con html2canvas */}
      <div 
        ref={shareRef}
        className="fixed top-0 w-[400px] bg-white p-0 z-[-1] overflow-hidden"
        style={{ left: '-9999px' }}
      >
        {/* Cabecera con Logo */}
        <div className="bg-green-50 p-6 flex items-center justify-center gap-3 border-b border-green-100">
          <div className="bg-green-600 p-2 rounded-full">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-green-700">Calorel</h1>
        </div>

        {/* Imagen de la comida */}
        <div className="w-full h-[300px] relative bg-white">
          {entry.image_url ? (
            <img 
              src={entry.image_url} 
              alt={entry.food_name} 
              className="w-full h-full object-cover"
              crossOrigin="anonymous" // CRÍTICO: Permite que html2canvas capture la imagen sin problemas de CORS
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

        {/* Datos Nutricionales */}
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
              <span className="text-xs text-gray-500">Prot</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-xl">
              <Wheat className="w-6 h-6 text-yellow-500 mb-1" />
              <span className="font-bold text-gray-800 text-sm">{entry.carbs_value || 0}g</span>
              <span className="text-xs text-gray-500">Carb</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-gray-50 rounded-xl">
              <Droplets className="w-6 h-6 text-blue-500 mb-1" />
              <span className="font-bold text-gray-800 text-sm">{entry.fats_value || 0}g</span>
              <span className="text-xs text-gray-500">Grasa</span>
            </div>
          </div>
          
          <div className="mt-6 text-center">
             <p className="text-sm text-gray-400">Generado con Calorel App</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnalysisDetailDrawer;