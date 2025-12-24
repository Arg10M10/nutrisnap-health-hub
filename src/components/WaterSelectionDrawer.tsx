import { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassWater, Milk, Droplets, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface WaterSelectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (amount: number) => void;
}

export const WaterSelectionDrawer = ({ isOpen, onClose, onAdd }: WaterSelectionDrawerProps) => {
  const { t } = useTranslation();
  const [customAmount, setCustomAmount] = useState('');

  const options = [
    { 
      id: 'glass_8oz', 
      label: '8 oz', 
      subLabel: 'Vaso', 
      amount: 1, 
      icon: GlassWater, 
      color: 'text-blue-400', 
      bgColor: 'bg-blue-400/10',
      borderColor: 'border-blue-400/20'
    },
    { 
      id: 'glass_12oz', 
      label: '12 oz', 
      subLabel: 'Grande', 
      amount: 1.5, 
      icon: Milk, 
      color: 'text-cyan-500', 
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20'
    },
    { 
      id: 'bottle_24oz', 
      label: '24 oz', 
      subLabel: 'Botella', 
      amount: 3, 
      icon: Droplets, 
      color: 'text-indigo-500', 
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20'
    },
  ];

  const handleOptionClick = (amount: number) => {
    onAdd(amount);
    onClose();
  };

  const handleCustomAdd = () => {
    const val = parseFloat(customAmount);
    if (!isNaN(val) && val > 0) {
      // Convertir oz a "vasos" (1 vaso = 8oz)
      const glasses = val / 8;
      onAdd(parseFloat(glasses.toFixed(2)));
      onClose();
      setCustomAmount('');
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle className="text-center text-xl font-bold text-foreground">
            {t('home.log_water_title', 'Registrar Agua')}
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="p-6 pt-2 space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {options.map((opt, idx) => (
              <motion.button
                key={opt.id}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleOptionClick(opt.amount)}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all aspect-[4/5] gap-2",
                  opt.bgColor,
                  opt.borderColor
                )}
              >
                <div className={cn("p-3 rounded-full bg-white shadow-sm", opt.color)}>
                  <opt.icon className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <span className="block text-lg font-bold text-foreground leading-tight">{opt.label}</span>
                  <span className="text-xs text-muted-foreground font-medium">{opt.subLabel}</span>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">O personalizado</span>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input 
                type="number" 
                placeholder="Cantidad" 
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="pr-12 h-12 text-lg"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">oz</span>
            </div>
            <Button 
              size="icon" 
              className="h-12 w-12 shrink-0 rounded-xl" 
              onClick={handleCustomAdd}
              disabled={!customAmount}
            >
              <Plus className="w-6 h-6" />
            </Button>
          </div>
        </div>
        <DrawerFooter className="pt-0 pb-8">
          <Button variant="ghost" onClick={onClose} size="lg" className="w-full rounded-xl">
            {t('common.cancel')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};