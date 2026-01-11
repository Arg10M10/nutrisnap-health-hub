import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { DietPlan } from "@/data/dietPlans";
import { CheckCircle2, XCircle, Target, Activity } from "lucide-react";

interface DietPlanDrawerProps {
  diet: DietPlan | null;
  isOpen: boolean;
  onClose: () => void;
}

const DietPlanDrawer = ({ diet, isOpen, onClose }: DietPlanDrawerProps) => {
  const { t } = useTranslation();

  if (!diet) return null;

  const rawIdealFor = t(diet.idealForKey as any, { returnObjects: true });
  const idealFor = Array.isArray(rawIdealFor) ? rawIdealFor : [];

  const rawNotRecommended = t(diet.notRecommendedKey as any, { returnObjects: true });
  const notRecommended = Array.isArray(rawNotRecommended) ? rawNotRecommended : [];

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh] flex flex-col bg-background">
        <div className="flex-1 overflow-y-auto no-scrollbar">
          
          {/* Header Image */}
          <div className="relative h-48 w-full">
            <img 
              src={diet.image} 
              alt={t(diet.nameKey as any)} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            <div className="absolute bottom-4 left-6">
                <h2 className="text-3xl font-black text-foreground leading-tight drop-shadow-md">
                    {t(diet.nameKey as any)}
                </h2>
            </div>
          </div>

          <div className="px-6 pb-8 space-y-8 -mt-2">
            
            {/* Description */}
            <p className="text-muted-foreground leading-relaxed">
              {t(diet.descriptionKey as any)}
            </p>

            {/* Macros */}
            <div className="bg-muted/40 p-4 rounded-xl border border-border/50">
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> {t('diet_plans.labels.macros')}
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-2xl font-bold text-red-500">{diet.macros.protein}</p>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground">{t('home.protein')}</p>
                    </div>
                    <div className="border-l border-border/50 pl-4">
                        <p className="text-2xl font-bold text-orange-500">{diet.macros.carbs}</p>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground">{t('home.carbs')}</p>
                    </div>
                    <div className="border-l border-border/50 pl-4">
                        <p className="text-2xl font-bold text-blue-500">{diet.macros.fats}</p>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground">{t('home.fats')}</p>
                    </div>
                </div>
            </div>

            {/* Objective */}
            <div>
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-foreground">
                    <Target className="w-5 h-5 text-primary" />
                    {t('diet_plans.labels.objective')}
                </h3>
                <p className="text-sm text-muted-foreground">
                    {t(diet.objectiveKey as any)}
                </p>
            </div>

            {/* Ideal For */}
            <div>
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    {t('diet_plans.labels.ideal_for')}
                </h3>
                <ul className="space-y-2">
                    {idealFor.map((item: any, idx: number) => (
                        <li key={idx} className="flex gap-3 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                            {typeof item === 'string' ? item : JSON.stringify(item)}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Not Recommended */}
            {notRecommended.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-red-700 dark:text-red-400">
                        <XCircle className="w-5 h-5" />
                        {t('diet_plans.labels.not_recommended')}
                    </h3>
                    <ul className="space-y-2">
                        {notRecommended.map((item: any, idx: number) => (
                            <li key={idx} className="flex gap-3 text-sm text-red-600/80 dark:text-red-300/80">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                                {typeof item === 'string' ? item : JSON.stringify(item)}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

          </div>
        </div>
        <DrawerFooter className="pt-2 pb-8 px-6 bg-background">
            <DrawerClose asChild>
                <Button size="lg" className="w-full h-12 text-lg rounded-2xl shadow-lg shadow-primary/20">
                    {t('common.understood')}
                </Button>
            </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default DietPlanDrawer;