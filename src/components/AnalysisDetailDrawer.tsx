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

interface AnalysisDetailDrawerProps {
  entry: FoodEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

const AnalysisDetailDrawer = ({ entry, isOpen, onClose }: AnalysisDetailDrawerProps) => {
  const { t } = useTranslation();
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

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh] flex flex-col">
        <DrawerHeader>
            <DrawerTitle className="text-center">{t('analysis.details_title')}</DrawerTitle>
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
  );
};

export default AnalysisDetailDrawer;