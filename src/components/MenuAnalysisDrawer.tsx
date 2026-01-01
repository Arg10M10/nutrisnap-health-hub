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
import { cn } from "@/lib/utils";

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
  return (
    <div className={cn(
      "p-4 rounded-2xl flex justify-between items-center transition-all border",
      type === 'recommended' 
        ? "bg-green-50/50 dark:bg-green-900/10 border-green-100/50 dark:border-green-900/30" 
        : "bg-red-50/50 dark:bg-red-900/10 border-red-100/50 dark:border-red-900/30"
    )}>
      <div className="flex-1 pr-4">
        <span className="font-bold text-foreground leading-tight block">{item.name}</span>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{item.reason}</p>
      </div>
      <Button 
        size="icon" 
        className={cn(
          "h-10 w-10 rounded-full shrink-0 shadow-sm transition-all active:scale-90",
          isCompleted 
            ? "bg-green-500 hover:bg-green-500 text-white" 
            : "bg-background border border-border/60 hover:bg-muted text-foreground"
        )} 
        onClick={onSelect} 
        disabled={isAnalyzing || isCompleted}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isAnalyzing ? (
            <motion.div key="loader" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Loader2 className="w-5 h-5 animate-spin" />
            </motion.div>
          ) : isCompleted ? (
            <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Check className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div key="plus" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Plus className="w-5 h-5 text-muted-foreground" />
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
        <DrawerHeader className="pb-2">
          <DrawerTitle className="flex items-center gap-2 justify-center text-xl text-primary font-bold">
            <Sparkles className="w-5 h-5" />
            {t('menu_analysis.title', 'Análisis del Menú')}
          </DrawerTitle>
        </DrawerHeader>

        <ScrollArea className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-6">
            <div className="bg-muted/40 p-4 rounded-2xl text-sm text-center text-muted-foreground italic border border-border/30 shadow-inner">
              "{data.summary}"
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-base flex items-center gap-2 text-green-600 px-1">
                <CheckCircle2 className="w-5 h-5" />
                {t('menu_analysis.recommended', 'Mejores Opciones')}
              </h3>
              <div className="grid gap-3">
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
            </div>

            {data.avoid && data.avoid.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-base flex items-center gap-2 text-red-500 px-1">
                  <XCircle className="w-5 h-5" />
                  {t('menu_analysis.avoid', 'Limitar o Evitar')}
                </h3>
                <div className="grid gap-3">
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
              </div>
            )}

            <div className="mt-4 flex gap-3 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-900/20">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <p className="text-xs text-blue-700/80 dark:text-blue-300/80 leading-relaxed">
                {t('menu_analysis.partial_list_note', 'Nota: Este análisis no incluye todo el menú. La IA ha filtrado el contenido para mostrarte únicamente las mejores opciones para tu objetivo y aquellas que deberías evitar.')}
              </p>
            </div>
          </div>
        </ScrollArea>

        <DrawerFooter className="pt-2 pb-6 px-6">
          <Button onClick={onClose} size="lg" variant="secondary" className="w-full h-14 text-lg rounded-2xl font-semibold">
            {t('analysis.close', 'Cerrar')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default MenuAnalysisDrawer;