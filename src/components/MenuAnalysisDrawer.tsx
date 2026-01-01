import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, Sparkles, Info, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AnalysisResult } from "./FoodAnalysisCard";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MenuItem {
  name: string;
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
  const { t, i18n } = useTranslation();
  const [analyzingMeal, setAnalyzingMeal] = useState<string | null>(null);

  if (!data) return null;

  const handleSelect = async (item: MenuItem) => {
    setAnalyzingMeal(item.name);
    try {
      const { data: analysisResult, error } = await supabase.functions.invoke('analyze-text-food', {
        body: {
          foodName: item.name,
          portionSize: 'medium', // Asumimos porción media por defecto
          language: i18n.language,
        },
      });

      if (error) throw error;

      onSelectMeal(analysisResult);

    } catch (error) {
      console.error("Error analyzing selected meal:", error);
      toast.error(t('manual_food.error_analysis'));
    } finally {
      setAnalyzingMeal(null);
    }
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
                <div key={idx} className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 p-3 rounded-xl">
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <span className="font-bold text-foreground flex-1">{item.name}</span>
                    <Button 
                      size="sm" 
                      className="h-8 rounded-full min-w-[70px]" 
                      onClick={() => handleSelect(item)} 
                      disabled={!!analyzingMeal}
                    >
                      {analyzingMeal === item.name ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        t('common.add')
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
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
                  <div key={idx} className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 p-3 rounded-xl opacity-90">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <span className="font-medium text-foreground flex-1">{item.name}</span>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        className="h-8 rounded-full min-w-[70px]" 
                        onClick={() => handleSelect(item)} 
                        disabled={!!analyzingMeal}
                      >
                        {analyzingMeal === item.name ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          t('common.add')
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
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