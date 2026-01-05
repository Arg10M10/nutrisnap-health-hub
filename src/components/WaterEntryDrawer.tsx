import { useState, useEffect } from "react";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Delete, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface WaterEntryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  beverage: {
    id: string;
    label: string;
    rate: number;
    color: string;
    icon: any;
  } | null;
  onConfirm: (amount: number) => void;
}

const WaterEntryDrawer = ({ isOpen, onClose, beverage, onConfirm }: WaterEntryDrawerProps) => {
  const { t } = useTranslation();
  const [amountStr, setAmountStr] = useState("0");

  // Reset al abrir
  useEffect(() => {
    if (isOpen) setAmountStr("0");
  }, [isOpen]);

  const handleNumClick = (num: string) => {
    if (amountStr === "0" && num !== ".") {
      setAmountStr(num);
    } else if (amountStr.includes(".") && num === ".") {
      return; // Ya hay un punto
    } else if (amountStr.length < 5) {
      setAmountStr(prev => prev + num);
    }
  };

  const handleDelete = () => {
    if (amountStr.length === 1) {
      setAmountStr("0");
    } else {
      setAmountStr(prev => prev.slice(0, -1));
    }
  };

  const handlePreset = (val: number) => {
    setAmountStr(val.toString());
  };

  const handleRegister = () => {
    const val = parseFloat(amountStr);
    if (val > 0) {
      onConfirm(val);
      onClose();
    }
  };

  if (!beverage) return null;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-[#FAF9F6] border-t-0 rounded-t-[32px] max-h-[95vh] flex flex-col outline-none">
        <div className="flex-1 flex flex-col items-center pt-6 pb-8 px-6 relative w-full max-w-md mx-auto">
          
          {/* Botón Cerrar Absolute */}
          <button 
            onClick={onClose} 
            className="absolute top-4 right-6 p-2 text-muted-foreground/50 hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Título y Tasa */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-1">{beverage.label}</h2>
            <p className="text-sm text-muted-foreground font-medium">
              Tasa de hidratación: <span className="text-primary font-bold">{Math.round(beverage.rate * 100)}%</span>
            </p>
          </div>

          {/* Icono Visual */}
          <div className="mb-6 relative">
             <div className={cn("w-20 h-20 rounded-full flex items-center justify-center shadow-lg", beverage.color.replace('text-', 'bg-').replace('600', '100').replace('500', '100').replace('700', '100'))}>
                <beverage.icon className={cn("w-8 h-8", beverage.color)} />
             </div>
          </div>

          {/* Botones Preset */}
          <div className="flex gap-3 mb-6 w-full justify-center">
            {[8, 12, 16].map((size) => (
              <button
                key={size}
                onClick={() => handlePreset(size)}
                className="bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-xl text-sm font-semibold text-foreground hover:bg-gray-50 active:scale-95 transition-all"
              >
                {size} oz
              </button>
            ))}
          </div>

          {/* Display Cantidad */}
          <div className="flex items-baseline justify-center mb-6 h-16">
            <span className="text-6xl font-black text-foreground tracking-tighter">{amountStr}</span>
            <span className="text-2xl text-muted-foreground font-semibold ml-2">oz</span>
          </div>

          {/* Teclado Numérico */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] mb-8">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumClick(num.toString())}
                className="h-14 rounded-2xl bg-white shadow-sm border border-gray-100 text-2xl font-semibold text-foreground hover:bg-gray-50 active:scale-95 transition-all"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => handleNumClick(".")}
              className="h-14 rounded-2xl bg-white shadow-sm border border-gray-100 text-2xl font-bold text-foreground hover:bg-gray-50 active:scale-95 transition-all pb-2"
            >
              .
            </button>
            <button
              onClick={() => handleNumClick("0")}
              className="h-14 rounded-2xl bg-white shadow-sm border border-gray-100 text-2xl font-semibold text-foreground hover:bg-gray-50 active:scale-95 transition-all"
            >
              0
            </button>
            <button
              onClick={handleDelete}
              className="h-14 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-foreground hover:bg-gray-50 active:scale-95 transition-all"
            >
              <Delete className="w-6 h-6 opacity-60" />
            </button>
          </div>

          {/* Botón Agregar */}
          <Button
            onClick={handleRegister}
            disabled={parseFloat(amountStr) === 0}
            className="w-full max-w-[280px] h-14 text-lg font-bold rounded-2xl shadow-lg transition-all active:scale-95"
            style={{
               backgroundColor: parseFloat(amountStr) > 0 ? 'hsl(var(--primary))' : '#E5E7EB',
               color: parseFloat(amountStr) > 0 ? 'white' : '#9CA3AF',
            }}
          >
            {t('common.add', 'Agregar')}
          </Button>

        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default WaterEntryDrawer;