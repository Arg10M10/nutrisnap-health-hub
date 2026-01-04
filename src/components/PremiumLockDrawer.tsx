import { useState } from "react";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Check, X, Leaf } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PremiumLockDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const PremiumLockDrawer = ({ isOpen, onClose }: PremiumLockDrawerProps) => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');

  const handleUnlock = () => {
    onClose();
    navigate('/register-premium');
  };

  const benefits = [
    { name: "Escáner de Comida con IA", free: false, premium: true },
    { name: "Análisis de Menús", free: false, premium: true },
    { name: "Planes de Dieta Semanales", free: false, premium: true },
    { name: "Sugerencias de Macros IA", free: false, premium: true },
    { name: "Registro de Peso y Agua", free: true, premium: true },
    { name: "Biblioteca de Recetas", free: true, premium: true },
  ];

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh] rounded-t-[24px] bg-[#FAF9F6] outline-none flex flex-col">
        <div className="overflow-y-auto no-scrollbar pb- safe-area-bottom flex-1">
          <div className="sr-only">
            <DrawerTitle>Calorel Premium</DrawerTitle>
          </div>
          
          {/* Header Section */}
          <div className="relative pt-6 px-6 pb-2 text-center">
            {/* Elemento decorativo */}
            <div className="absolute top-0 right-0 opacity-20 pointer-events-none">
                <Leaf className="w-24 h-24 text-primary rotate-[-45deg] -mr-8 -mt-4" fill="currentColor" />
            </div>

            <h2 className="text-xl font-bold leading-tight text-foreground mb-2 px-4">
              Únete a <span className="text-primary font-black">Calorel</span> premium para formar una mejor versión de ti.
            </h2>
            <p className="text-xs text-muted-foreground">
              Con Calorel premium, los usuarios logran su objetivo 3 veces más rápido.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="px-4 py-3">
            <div className="bg-white rounded-2xl shadow-sm border border-border/40 overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[1.5fr_1fr_1fr] border-b border-border/40">
                <div className="p-2.5"></div>
                <div className="p-2.5 text-center text-[10px] font-bold text-muted-foreground tracking-wider self-center">GRATIS</div>
                <div className="p-2.5 text-center text-[10px] font-bold text-primary-foreground bg-primary tracking-wider self-center">PREMIUM</div>
              </div>

              {/* Rows */}
              {benefits.map((benefit, index) => (
                <div key={index} className="grid grid-cols-[1.5fr_1fr_1fr] border-b border-border/40 last:border-0 items-center">
                  <div className="p-2.5 text-[11px] font-medium text-foreground leading-tight">
                    {benefit.name}
                  </div>
                  <div className="p-1.5 flex justify-center">
                    {benefit.free ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : (
                      <X className="w-4 h-4 text-red-300" />
                    )}
                  </div>
                  <div className="p-1.5 flex justify-center bg-primary/5 h-full items-center">
                    {benefit.premium && (
                      <div className="bg-primary rounded-full p-0.5">
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Options */}
          <div className="px-4 space-y-3 mb-2">
            {/* Annual Plan (Best Value) */}
            <motion.div 
              className={cn(
                "relative rounded-2xl border-2 overflow-hidden cursor-pointer transition-all shadow-sm",
                selectedPlan === 'annual' ? "border-primary bg-white" : "border-transparent bg-white/60"
              )}
              onClick={() => setSelectedPlan('annual')}
              whileTap={{ scale: 0.98 }}
            >
              <div className="bg-primary text-white text-center py-1 text-xs font-bold tracking-wide">
                AHORRA 67%
              </div>
              <div className="p-3 flex flex-col items-center">
                <p className="text-xs font-semibold text-foreground mb-0.5">Plan Anual (Mejor Valor)</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-foreground">$2.99</span>
                  <span className="text-muted-foreground text-xs font-medium">/mes</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 line-through opacity-60">$108.00</p>
                <p className="text-[10px] text-primary font-bold">Se cobra $35.99 al año</p>
                
                {selectedPlan === 'annual' && (
                  <div className="absolute top-8 right-3 text-primary">
                    <div className="bg-primary/10 rounded-full p-1">
                      <Check className="w-3 h-3" />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Monthly Plan */}
            <motion.div 
              className={cn(
                "relative rounded-2xl border-2 bg-white p-3 flex items-center justify-between cursor-pointer transition-all",
                selectedPlan === 'monthly' ? "border-primary shadow-sm" : "border-border/30 shadow-none opacity-80"
              )}
              onClick={() => setSelectedPlan('monthly')}
              whileTap={{ scale: 0.98 }}
            >
              <span className="font-semibold text-sm text-foreground">Mensual</span>
              <span className="font-bold text-base text-foreground">$9.00/mes</span>
              
              {selectedPlan === 'monthly' && (
                <div className="absolute top-1/2 -translate-y-1/2 right-3 text-primary">
                   <div className="bg-primary/10 rounded-full p-1">
                      <Check className="w-3 h-3" />
                    </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* CTA Section */}
          <div className="px-6 mt-4 pb-6">
            <Button 
              size="lg" 
              className="w-full h-12 text-base font-bold rounded-full shadow-lg shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleUnlock}
            >
              Continuar
            </Button>
            
            <p className="text-center text-[9px] text-muted-foreground mt-3 flex justify-center gap-4">
              <span className="cursor-pointer underline">Términos</span>
              <span className="cursor-pointer underline">Privacidad</span>
              <span className="cursor-pointer underline">Restaurar</span>
            </p>
            
            <div className="mt-3 text-center">
               <button onClick={onClose} className="text-[10px] text-muted-foreground/50 font-medium hover:text-foreground transition-colors p-2">
                 No gracias, continuaré limitado
               </button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default PremiumLockDrawer;