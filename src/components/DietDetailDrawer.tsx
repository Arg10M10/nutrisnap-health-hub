import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Diet } from "@/data/diets";
import { Check, X, Target, Users, AlertTriangle, PieChart } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DietDetailDrawerProps {
  diet: Diet | null;
  isOpen: boolean;
  onClose: () => void;
}

const DietDetailDrawer = ({ diet, isOpen, onClose }: DietDetailDrawerProps) => {
  const { t } = useTranslation();
  if (!diet) return null;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[92vh] flex flex-col bg-background">
        
        {/* Header con Imagen */}
        <div className="relative h-48 w-full flex-shrink-0">
            <img src={diet.image} alt={t(diet.nameKey as any)} className="w-full h-full object-cover rounded-t-[10px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            <div className="absolute bottom-4 left-6">
                <h2 className="text-3xl font-black text-foreground leading-none">{t(diet.nameKey as any)}</h2>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6" data-vaul-scrollable>
          <div className="space-y-8">
            
            {/* Descripción */}
            <div>
              <p className="text-muted-foreground text-base leading-relaxed">
                {t(diet.descriptionKey as any)}
              </p>
            </div>

            {/* Objetivo */}
            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" /> {t('diet_list.objective')}
                </h3>
                <p className="text-sm font-medium text-foreground">
                    {t(diet.objectiveKey as any)}
                </p>
            </div>

            {/* Ideal Para */}
            <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" /> {t('diet_list.ideal_for')}
                </h3>
                <ul className="space-y-3">
                    {diet.idealForKeys?.map((key, idx) => (
                        <li key={idx} className="flex gap-3 text-sm">
                            <div className="mt-0.5 min-w-[20px]">
                                <Check className="w-5 h-5 text-green-500" />
                            </div>
                            <span className="text-foreground/90">{t(key as any)}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* No Recomendada Para */}
            <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> {t('diet_list.not_recommended_for')}
                </h3>
                <ul className="space-y-3">
                    {diet.notRecommendedForKeys?.map((key, idx) => (
                        <li key={idx} className="flex gap-3 text-sm">
                            <div className="mt-0.5 min-w-[20px]">
                                <X className="w-5 h-5 text-red-500" />
                            </div>
                            <span className="text-foreground/90">{t(key as any)}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Macros Objetivo */}
            {diet.macros && (
                <div className="bg-muted/30 p-5 rounded-2xl border border-border">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                        <PieChart className="w-4 h-4" /> {t('diet_list.target_macros')}
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-lg font-black text-red-500">{diet.macros.protein}</div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase">Proteína</div>
                        </div>
                        <div>
                            <div className="text-lg font-black text-orange-500">{diet.macros.carbs}</div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase">Carbos</div>
                        </div>
                        <div>
                            <div className="text-lg font-black text-blue-500">{diet.macros.fats}</div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase">Grasas</div>
                        </div>
                    </div>
                </div>
            )}

          </div>
        </div>

        <DrawerFooter className="pt-4 border-t flex-shrink-0 bg-background pb-8">
          <Button onClick={onClose} size="lg" className="w-full h-14 text-lg font-bold rounded-xl shadow-lg">
            {t('common.understood')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default DietDetailDrawer;