import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import FoodAnalysisCard, { AnalysisResult } from "@/components/FoodAnalysisCard";
import { PlusCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AnalysisResultDrawerProps {
  result: AnalysisResult | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const AnalysisResultDrawer = ({ result, isOpen, onClose, onSave }: AnalysisResultDrawerProps) => {
  const { t } = useTranslation();
  if (!result) return null;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh] flex flex-col">
        <div data-vaul-scrollable className="overflow-y-auto flex-1">
          <div className="p-4 space-y-6">
            <FoodAnalysisCard result={result} />
          </div>
        </div>
        <DrawerFooter className="pt-4 border-t flex-shrink-0">
          <Button onClick={onSave} size="lg" className="h-14 text-base">
            <PlusCircle className="mr-2 w-5 h-5" /> {t('analysis.save_to_diary')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default AnalysisResultDrawer;