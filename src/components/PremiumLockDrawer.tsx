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
    { name: "Escáner de Comida IA", free: false, premium: true },
    { name: "Análisis de Menús", free: false, premium: true },
    { name: "Planes de Dieta", free: false, premium: true },
    { name: "Sugerencias Macros", free: false, premium: true },
    { name: "Registro Peso/Agua", free: true, premium: true },
    { name: "Recetas", free: true, premium: true },
  ];

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[96vh] rounded-t-[24px] bg-[#FAF9F6] outline-none flex flex-col">
        {/* Contenedor principal */}
        <div className="flex-1 flex flex-col w-full max-w-md mx-auto">
          <div className="sr-only">
            <DrawerTitle>Calorel Premium</DrawerTitle>
          </div>
          
          {/* Header */}
          <div className="relative pt-8 px-6 pb-4 text-center shrink-0">
            <div className="absolute top-4 right-4 opacity-15 pointer-events-none">
                <Leaf className="w-24 h-24 text-primary rotate-[-45deg]" fill="currentColor" />
            </div>

            <h2 className="text-2xl font-bold leading-tight text-foreground mb-2 px-2">
              Mejora tu versión con <span className="text-primary font-black">Calorel Premium</span>
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              Logra tu objetivo 3x más rápido.
            </p>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto px-5 py-2 space-y-5" data-vaul-no-drag>
            
            {/* Tabla Comparativa */}
            <div className="bg-white rounded-2xl shadow-sm border border-border/40 overflow-hidden">
              <div className="grid grid-cols-[1.6fr_1fr_1fr] border-b border-border/40 bg-gray-50/50">
                <div className="p-3"></div>
                <div className="p-3 text-center text-xs font-bold text-muted-foreground tracking-wider self-center">GRATIS</div>
                <div className="p-3 text-center text-xs font-bold text-primary-foreground bg-primary tracking-wider self-center">PREMIUM</div>
              </div>

              {benefits.map((benefit, index) => (
                <div key={index} className="grid grid-cols-[1.6fr_1fr_1fr] border-b border-border/30 last:border-0 items-center min-h-[44px]">
                  <div className="px-4 text-sm font-medium text-foreground leading-tight">
                    {benefit.name}
                  </div>
                  <div className="flex justify-center">
                    {benefit.free ? <Check className="w-5 h-5 text-muted-foreground" /> : <X className="w-5 h-5 text-muted-foreground/30" />}
                  </div>
                  <div className="flex justify-center bg-primary/5 h-full items-center py-2">
                    {benefit.premium && (
                      <div className="bg-primary rounded-full p-0.5 shadow-sm">
                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Opciones de Precio */}
            <div className="space-y-4 mb-2">
              {/* Anual */}
              <motion.div 
                className={cn(
                  "relative rounded-2xl border-2 overflow-hidden cursor-pointer transition-all shadow-sm",
                  selectedPlan === 'annual' ? "border-primary bg-white ring-1 ring-primary/10" : "border-transparent bg-white/60"
                )}
                onClick={() => setSelectedPlan('annual')}
                whileTap={{ scale: 0.98 }}
              >
                <div className="bg-primary text-white text-center py-1.5 text-xs font-bold tracking-wide">
                  AHORRA 67%
                </div>
                <div className="p-4 flex flex-col items-center">
                  <p className="text-sm font-bold text-foreground mb-1">Plan Anual (Mejor Valor)</p>
                  <div className="flex items-baseline gap-1 my-1">
                    <span className="text-4xl font-black text-foreground">$3.00</span>
                    <span className="text-muted-foreground text-sm font-medium">/mes</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-through opacity-60">$108.00</p>
                  <p className="text-xs text-primary font-bold mt-1">Se cobra $36.00 al año</p>
                  
                  {selectedPlan === 'annual' && (
                    <div className="absolute top-10 right-4 text-primary">
                      <div className="bg-primary/10 rounded-full p-1.5">
                        <Check className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Mensual */}
              <motion.div 
                className={cn(
                  "relative rounded-2xl border-2 bg-white p-4 flex items-center justify-between cursor-pointer transition-all",
                  selectedPlan === 'monthly' ? "border-primary shadow-sm" : "border-transparent shadow-none opacity-80"
                )}
                onClick={() => setSelectedPlan('monthly')}
                whileTap={{ scale: 0.98 }}
              >
                <span className="font-bold text-base text-foreground">Mensual</span>
                <span className="text-lg font-bold text-foreground">$9.00<span className="text-sm font-normal text-muted-foreground">/mes</span></span>
                
                {selectedPlan === 'monthly' && (
                  <div className="absolute top-1/2 -translate-y-1/2 right-4 text-primary">
                     <div className="bg-primary/10 rounded-full p-1.5">
                        <Check className="w-4 h-4" />
                      </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Footer Fijo */}
          <div className="p-5 pt-3 pb-8 bg-[#FAF9F6] shrink-0">
            <Button 
              size="lg" 
              className="w-full h-14 text-lg font-bold rounded-full shadow-xl shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90 transition-transform active:scale-95"
              onClick={handleUnlock}
            >
              Continuar
            </Button>
            
            <div className="mt-4 flex justify-center gap-6 text-xs text-muted-foreground/80 font-medium">
              <button className="hover:text-foreground hover:underline">Términos</button>
              <button className="hover:text-foreground hover:underline">Privacidad</button>
              <button className="hover:text-foreground hover:underline">Restaurar</button>
            </div>
            
            <div className="mt-3 text-center">
               <button onClick={onClose} className="text-xs text-muted-foreground/60 font-medium hover:text-foreground p-2 transition-colors">
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