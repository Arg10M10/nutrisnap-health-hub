import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, AlertCircle, Sparkles, Info } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface MenuAnalysisData {
  recommended: { name: string; calories: string; reason: string }[];
  avoid: { name: string; calories: string; reason: string }[];
  summary: string;
}

interface MenuAnalysisDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: MenuAnalysisData | null;
}

const MenuAnalysisDrawer = ({ isOpen, onClose, data }: MenuAnalysisDrawerProps) => {
  const { t } = useTranslation();

  if (!data) return null;

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
            {/* Summary */}
            <div className="bg-muted/50 p-4 rounded-xl text-sm text-center text-muted-foreground italic">
              "{data.summary}"
            </div>

            {/* Recommended */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
                {t('menu_analysis.recommended', 'Mejores Opciones')}
              </h3>
              {data.recommended.map((item, idx) => (
                <div key={idx} className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 p-3 rounded-xl">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-foreground">{item.name}</span>
                    <span className="text-xs font-semibold bg-white dark:bg-black/20 px-2 py-0.5 rounded text-green-700 dark:text-green-400 whitespace-nowrap ml-2">
                      {item.calories}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.reason}</p>
                </div>
              ))}
            </div>

            {/* Avoid */}
            {data.avoid && data.avoid.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2 text-red-500">
                  <XCircle className="w-5 h-5" />
                  {t('menu_analysis.avoid', 'Limitar o Evitar')}
                </h3>
                {data.avoid.map((item, idx) => (
                  <div key={idx} className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 p-3 rounded-xl opacity-90">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-foreground">{item.name}</span>
                      <span className="text-xs font-semibold bg-white dark:bg-black/20 px-2 py-0.5 rounded text-red-700 dark:text-red-400 whitespace-nowrap ml-2">
                        {item.calories}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.reason}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Disclaimer Text */}
            <div className="mt-4 flex gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/50">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                {t('menu_analysis.partial_list_note', 'Nota: Este análisis no incluye todo el menú. La IA ha filtrado el contenido para mostrarte únicamente las mejores opciones para tu objetivo y aquellas que deberías evitar.')}
              </p>
            </div>
          </div>
        </ScrollArea>

        <DrawerFooter className="pt-2">
          <Button onClick={onClose} size="lg" className="w-full h-14 text-lg rounded-xl">
            {t('common.understood', 'Entendido')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default MenuAnalysisDrawer;