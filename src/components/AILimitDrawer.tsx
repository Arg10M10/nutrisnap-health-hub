import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Lock, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AILimitDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  limit: number;
  timeFrame: 'daily' | 'weekly';
}

const AILimitDrawer = ({ isOpen, onClose, limit, timeFrame }: AILimitDrawerProps) => {
  const { t } = useTranslation();

  const title = t('common.ai_limit_reached');
  const description = timeFrame === 'daily' 
    ? t('common.ai_limit_daily_desc', { limit }) 
    : t('common.ai_limit_weekly_desc', { limit });

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader className="text-center pt-8">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <DrawerTitle className="text-2xl font-bold">{title}</DrawerTitle>
            <DrawerDescription className="text-base mt-2 text-muted-foreground leading-relaxed">
              {description}
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="pb-8 px-6">
            <Button onClick={onClose} size="lg" className="w-full h-14 text-lg rounded-2xl">
              <Clock className="mr-2 h-5 w-5" />
              {t('common.understood')}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default AILimitDrawer;