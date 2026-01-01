import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, Sparkles, Info, Plus, Check, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

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
}

const MealItem = ({ item, type, onSelect, isAnalyzing, isCompleted }: { item: MenuItem, type: 'recommended' | 'avoid', onSelect: () => void, isAnalyzing: boolean, isCompleted: boolean }) => {
  const colorClass = type === 'recommended' ? 'green' : 'red';

  return (
    <div className={`bg-${colorClass}-50 dark:bg-${colorClass}-900/20 border border-${colorClass}-100 dark:border-${colorClass}-900/50 p-3 rounded-xl flex justify-between items-center`}>
      <div className="flex-1 pr-4">
        <span className="font-bold text-foreground">{item.name}</span>
        <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
      </div>
      <Button size="icon" className="h-12 w-12 rounded-full shrink-0" onClick={onSelect} disabled={isAnalyzing || isCompleted}>
        <AnimatePresence mode="wait" initial={false}>
          {isAnalyzing ? (
            <motion.div key="loader" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Loader2 className="w-6 h-6 animate-spin" />
            </motion.div>
          ) : isCompleted ? (
            <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Check className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="plus" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Plus className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </div>
  );
};

const MenuAnalysisDrawer = ({ isOpen, onClose, data }: MenuAnalysisDrawerProps) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [analyzingMeal, setAnalyzingMeal] = useState<string | null>(null);
  const [completedMeal, setCompletedMeal] = useState<string | null>(null);

  if (!data) return null;

  const handleSelect = async (item: MenuItem) => {
    if (!user || analyzingMeal || completedMeal) return;
    
    setAnalyzingMeal(item.name);
    try {
      const { data: newEntry, error: insertError } = await supabase
        .from('food_entries')
        .insert({
          user_id: user.id,
          food_name: item.name,
          status: 'processing',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      queryClient.invalidateQueries({ queryKey: ['food_entries', user.id] });

      const { error: functionError } = await supabase.functions.invoke('analyze-text-food', {
        body: {
          entry_id: newEntry.id,
          foodName: item.name,
          portionSize: 'medium',
          language: i18n.language,
        },
      });

      if (functionError) {
        await supabase.from('food_entries').update({ status: 'failed', reason: 'Analysis failed to start.' }).eq('id', newEntry.id);
        queryClient.invalidateQueries({ queryKey: ['food_entries', user.id] });
        throw functionError;
      }

      setAnalyzingMeal(null);
      setCompletedMeal(item.name);

      setTimeout(() => {
        onClose();
        setTimeout(() => setCompletedMeal(null), 300); 
      }, 800);

    } catch (error) {
      console.error("Error analyzing selected meal:", error);
      toast.error(t('manual_food.error_analysis'));
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
                <MealItem 
                  key={`rec-${idx}`}
                  item={item}
                  type="recommended"
                  onSelect={() => handleSelect(item)}
                  isAnalyzing={analyzingMeal === item.name}
                  isCompleted={completedMeal === item.name}
                />
              ))}
            </div>

            {data.avoid && data.avoid.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2 text-red-500">
                  <XCircle className="w-5 h-5" />
                  {t('menu_analysis.avoid', 'Limitar o Evitar')}
                </h3>
                {data.avoid.map((item, idx) => (
                  <MealItem 
                    key={`avoid-${idx}`}
                    item={item}
                    type="avoid"
                    onSelect={() => handleSelect(item)}
                    isAnalyzing={analyzingMeal === item.name}
                    isCompleted={completedMeal === item.name}
                  />
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