import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
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

  // Calculamos el valor real hidratante para mostrarlo (opcional, pero informativo)
  const realHydration = parseFloat(amountStr) * beverage.rate;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-[#FAF9F6] border-t-0 rounded-t-[32px] max-h-[90vh] flex flex-col">
        <div className="flex-1 flex flex-col items-center pt-2 pb-8 px-6 relative">
          
          {/* Botón Cerrar Absolute */}
          <button 
            onClick={onClose} 
            className="absolute top-4 right-6 text-muted-foreground/50 hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Título y Tasa */}
          <div className="text-center mb-6 mt-2">
            <h2 className="text-2xl font-bold text-foreground mb-1">{beverage.label}</h2>
            <p className="text-sm text-muted-foreground font-medium">
              Tasa de hidratación: <span className="text-primary font-bold">{Math.round(beverage.rate * 100)}%</span>
            </p>
          </div>

          {/* Icono Visual */}
          <div className="mb-8 relative">
             <div className={cn("w-24 h-24 rounded-full flex items-center justify-center shadow-lg", beverage.color.replace('text-', 'bg-').replace('600', '100').replace('500', '100'))}>
                <beverage.icon className={cn("w-10 h-10", beverage.color)} />
             </div>
             {/* Burbuja indicadora si la tasa no es 100% */}
             {beverage.rate < 1 && (
                <div className="absolute -bottom-2 -right-2 bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-full border border-orange-200">
                    -{Math.round((1 - beverage.rate) * 100)}%
                </div>
             )}
          </div>

          {/* Botones Preset */}
          <div className="flex gap-3 mb-8 w-full justify-center">
            {[8, 12, 16].map((size) => (
              <button
                key={size}
                onClick={() => handlePreset(size)}
                className="bg-white border border-gray-100 shadow-sm px-4 py-2 rounded-2xl text-sm font-semibold text-foreground hover:bg-gray-50 active:scale-95 transition-all"
              >
                + {size}oz
              </button>
            ))}
          </div>

          {/* Display Cantidad */}
          <div className="flex items-baseline justify-center mb-8">
            <span className="text-6xl font-bold text-foreground tracking-tight">{amountStr}</span>
            <span className="text-2xl text-muted-foreground font-medium ml-1">oz</span>
          </div>

          {/* Teclado Numérico */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-[300px] mb-8">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumClick(num.toString())}
                className="h-16 rounded-2xl bg-[#F0EFE9] text-2xl font-semibold text-foreground hover:bg-[#E6E5DE] active:scale-95 transition-all"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => handleNumClick(".")}
              className="h-16 rounded-2xl bg-[#F0EFE9] text-2xl font-bold text-foreground hover:bg-[#E6E5DE] active:scale-95 transition-all pb-3"
            >
              .
            </button>
            <button
              onClick={() => handleNumClick("0")}
              className="h-16 rounded-2xl bg-[#F0EFE9] text-2xl font-semibold text-foreground hover:bg-[#E6E5DE] active:scale-95 transition-all"
            >
              0
            </button>
            <button
              onClick={handleDelete}
              className="h-16 rounded-2xl bg-[#F0EFE9] flex items-center justify-center text-foreground hover:bg-[#E6E5DE] active:scale-95 transition-all"
            >
              <Delete className="w-6 h-6 opacity-70" />
            </button>
          </div>

          {/* Botón Registro */}
          <Button
            onClick={handleRegister}
            disabled={parseFloat(amountStr) === 0}
            className="w-full max-w-[300px] h-14 text-lg font-bold rounded-2xl shadow-xl transition-all"
            style={{
               backgroundColor: parseFloat(amountStr) > 0 ? '#9CA3AF' : '#E5E7EB', // Gris oscuro activo, claro inactivo (estilo iOS/Imagen)
               color: 'white',
               backgroundImage: parseFloat(amountStr) > 0 ? 'linear-gradient(to right, hsl(var(--primary)), hsl(var(--primary)))' : 'none'
            }}
          >
            Registro
          </Button>

        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default WaterEntryDrawer;