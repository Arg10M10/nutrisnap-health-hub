import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, Sparkles, Info, Plus, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AnalysisResult } from "./FoodAnalysisCard";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface MenuItem {
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
  sugars: string;
  fiber: string;
  healthRating: string;
  reason: string;
}

export interface MenuAnalysisData {
  recommended: MenuItem[];
  avoid: MenuItem[];
  summary: string;
}

interface MenuAnalysisDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: MenuAnalysisData | null;
  onSelectMeal: (meal: AnalysisResult) => void;
}

const MenuAnalysisDrawer = ({ isOpen, onClose, data, onSelectMeal }: MenuAnalysisDrawerProps) => {
  const { t } = useTranslation();
  const [selectedMealName, setSelectedMealName] = useState<string | null>(null);

  if (!data) return null;

  const handleSelect = (item: MenuItem) => {
    setSelectedMealName(item.name);

    const mealResult: AnalysisResult = {
      foodName: item.name,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fats: item.fats,
      sugars: item.sugars,
      fiber: item.fiber,
      healthRating: item.healthRating,
      reason: item.reason,
    };
    
    // Pequeño delay para que el usuario vea el check
    setTimeout(() => {
      onSelectMeal(mealResult);
    }, 300);
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh] flex flex-col">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2 justify-center text-xl text-primary">
            <Sparkles className="w-5 h-5" />
            {t('menu_analysis.title', 'Análisis del Menú')}
          </DrawerTitle>
        </DrawerHeader>

        <ScrollArea className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-xl text-sm text-center text-muted-foreground italic">
              "{data.summary}"
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
                {t('menu_analysis.recommended', 'Mejores Opciones')}
              </h3>
              {data.recommended.map((item, idx) => (
                <div key={idx} className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 p-3 rounded-xl flex justify-between items-center">
                  <div className="flex-1">
                    <span className="font-bold text-foreground">{item.name}</span>
                    <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
                  </div>
                  <Button size="icon" className="h-10 w-10 rounded-full shrink-0 ml-3" onClick={() => handleSelect(item)}>
                    <AnimatePresence mode="wait" initial={false}>
                      {selectedMealName === item.name ? (
                        <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                          <Check className="w-5 h-5" />
                        </motion.div>
                      ) : (
                        <motion.div key="plus" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                          <Plus className="w-5 h-5" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </div>
              ))}
            </div>

            {data.avoid && data.avoid.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2 text-red-500">
                  <XCircle className="w-5 h-5" />
                  {t('menu_analysis.avoid', 'Limitar o Evitar')}
                </h3>
                {data.avoid.map((item, idx) => (
                  <div key={idx} className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 p-3 rounded-xl opacity-90 flex justify-between items-center">
                    <div className="flex-1">
                      <span className="font-medium text-foreground">{item.name}</span>
                      <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
                    </div>
                    <Button size="icon" variant="destructive" className="h-10 w-10 rounded-full shrink-0 ml-3" onClick={() => handleSelect(item)}>
                      <AnimatePresence mode="wait" initial={false}>
                        {selectedMealName === item.name ? (
                          <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            <Check className="w-5 h-5" />
                          </motion.div>
                        ) : (
                          <motion.div key="plus" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            <Plus className="w-5 h-5" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/50">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                {t('menu_analysis.partial_list_note', 'Nota: Este análisis no incluye todo el menú. La IA ha filtrado el contenido para mostrarte únicamente las mejores opciones para tu objetivo y aquellas que deberías evitar.')}
              </p>
            </div>
          </div>
        </ScrollArea>

        <DrawerFooter className="pt-2">
          <Button onClick={onClose} size="lg" variant="outline" className="w-full h-14 text-lg rounded-xl">
            {t('analysis.close', 'Cerrar')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default MenuAnalysisDrawer;