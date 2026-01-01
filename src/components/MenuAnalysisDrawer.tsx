import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, Sparkles, Info, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
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

const MealItem = ({ item, type, onSelect, isAnalyzing, isLast }: { item: MenuItem, type: 'recommended' | 'avoid', onSelect: () => void, isAnalyzing: boolean, isLast: boolean }) => {
  const color = type === 'recommended' ? 'green' : 'red';

  return (
    <div className="relative pl-8">
      {/* Timeline elements */}
      <div className="absolute left-0 top-2.5 flex flex-col items-center h-full">
        <div className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all z-10",
          isAnalyzing ? `border-${color}-500 bg-${color}-500` : `border-muted-foreground/50 bg-background`
        )}>
          {isAnalyzing && <Loader2 className="w-3 h-3 animate-spin text-white" />}
        </div>
        {!isLast && <div className="flex-1 w-px bg-muted-foreground/20" />}
      </div>

      {/* Clickable content */}
      <button 
        onClick={onSelect} 
        disabled={isAnalyzing}
        className="ml-4 p-3 rounded-xl text-left w-full transition-colors hover:bg-muted/50 disabled:hover:bg-transparent"
      >
        <p className="font-bold text-foreground">{item.name}</p>
        <p className="text-sm text-muted-foreground">{item.reason}</p>
      </button>
    </div>
  )
}

const MenuAnalysisDrawer = ({ isOpen, onClose, data }: MenuAnalysisDrawerProps) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [analyzingMeal, setAnalyzingMeal] = useState<string | null>(null);

  if (!data) return null;

  const handleSelect = async (item: MenuItem) => {
    if (!user) {
      toast.error("You must be logged in to add a meal.");
      return;
    }
    setAnalyzingMeal(item.name);
    try {
      // 1. Create a processing entry in the database
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

      // 2. Invalidate query to show the processing card immediately
      queryClient.invalidateQueries({ queryKey: ['food_entries', user.id] });
      onClose(); // Close drawer immediately for better UX

      // 3. Invoke the edge function to perform the analysis
      const { error: functionError } = await supabase.functions.invoke('analyze-text-food', {
        body: {
          entry_id: newEntry.id,
          foodName: item.name,
          portionSize: 'medium',
          language: i18n.language,
        },
      });

      if (functionError) {
        // If function fails, update the entry to 'failed'
        await supabase.from('food_entries').update({ status: 'failed', reason: 'Analysis failed to start.' }).eq('id', newEntry.id);
        queryClient.invalidateQueries({ queryKey: ['food_entries', user.id] });
        throw functionError;
      }

    } catch (error) {
      console.error("Error analyzing selected meal:", error);
      toast.error(t('manual_food.error_analysis'));
      setAnalyzingMeal(null); // Reset loading state on error
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
                  isLast={idx === data.recommended.length - 1 && (!data.avoid || data.avoid.length === 0)}
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
                    isLast={idx === data.avoid.length - 1}
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