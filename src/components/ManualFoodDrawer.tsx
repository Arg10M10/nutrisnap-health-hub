import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import ManualFoodEntry from "@/components/ManualFoodEntry";
import { useTranslation } from "react-i18next";
import { Utensils } from "lucide-react";

interface ManualFoodDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManualFoodDrawer = ({ isOpen, onClose }: ManualFoodDrawerProps) => {
  const { t } = useTranslation();

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="flex items-center justify-center gap-2 text-xl font-bold">
              <Utensils className="w-5 h-5" />
              {t('manual_food.title')}
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pb-8">
            <ManualFoodEntry embedded={true} onSuccess={onClose} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ManualFoodDrawer;