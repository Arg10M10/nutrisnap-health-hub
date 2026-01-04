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
    { name: "Registro de Peso", free: false, premium: true },
    { name: "Sugerencias Macros", free: false, premium: true },
    { name: "Registro de Agua", free: true, premium: true },
  ];

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[96vh] rounded-t-[24px] bg-[#FAF9F6] outline-none flex flex-col">
        {/* Contenedor principal sin scroll global para evitar rebotes, solo scroll en contenido si hace falta */}
        <div className="flex-1 flex flex-col w-full max-w-md mx-auto">
          <div className="sr-only">
            <DrawerTitle>Calorel Premium</DrawerTitle>
          </div>
          
          {/* Header Compacto */}
          <div className="relative pt-6 px-5 pb-2 text-center shrink-0">
            <div className="absolute top-2 right-2 opacity-15 pointer-events-none">
                <Leaf className="w-20 h-20 text-primary rotate-[-45deg]" fill="currentColor" />
            </div>

            <h2 className="text-xl font-bold leading-tight text-foreground mb-1">
              Mejora tu versión con <span className="text-primary font-black">Calorel Premium</span>
            </h2>
            <p className="text-xs text-muted-foreground font-medium">
              Logra tu objetivo 3x más rápido.
            </p>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4" data-vaul-no-drag>
            
            {/* Tabla Compacta */}
            <div className="bg-white rounded-xl shadow-sm border border-border/40 overflow-hidden">
              <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr] border-b border-border/40 bg-gray-50/50">
                <div className="p-2"></div>
                <div className="p-2 text-center text-[10px] font-bold text-muted-foreground tracking-wider self-center">GRATIS</div>
                <div className="p-2 text-center text-[10px] font-bold text-primary-foreground bg-primary tracking-wider self-center">PREMIUM</div>
              </div>

              {benefits.map((benefit, index) => (
                <div key={index} className="grid grid-cols-[1.4fr_0.8fr_0.8fr] border-b border-border/30 last:border-0 items-center h-10">
                  <div className="px-3 text-[11px] font-medium text-foreground leading-tight truncate">
                    {benefit.name}
                  </div>
                  <div className="flex justify-center">
                    {benefit.free ? <Check className="w-3.5 h-3.5 text-muted-foreground" /> : <X className="w-3.5 h-3.5 text-muted-foreground/30" />}
                  </div>
                  <div className="flex justify-center bg-primary/5 h-full items-center">
                    {benefit.premium && (
                      <div className="bg-primary rounded-full p-0.5 shadow-sm">
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Opciones de Precio */}
            <div className="space-y-3">
              {/* Anual */}
              <motion.div 
                className={cn(
                  "relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all shadow-sm",
                  selectedPlan === 'annual' ? "border-primary bg-white ring-1 ring-primary/20" : "border-transparent bg-white/60"
                )}
                onClick={() => setSelectedPlan('annual')}
                whileTap={{ scale: 0.99 }}
              >
                <div className="bg-primary text-white text-center py-1 text-[10px] font-bold tracking-wide uppercase">
                  Ahorra 67%
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground">Anual</span>
                    <span className="text-[10px] text-muted-foreground line-through">$108.00</span>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-primary">$3.00</span>
                      <span className="text-xs font-medium text-muted-foreground">/mes</span>
                    </div>
                    <span className="text-[10px] font-semibold text-primary/80">$36.00 facturado hoy</span>
                  </div>

                  {selectedPlan === 'annual' && (
                    <div className="absolute top-2 left-2 text-primary">
                      {/* Check mark decorativo o indicador de selección */}
                    </div>
                  )}
                </div>
                {selectedPlan === 'annual' && (
                  <div className="absolute inset-0 border-2 border-primary rounded-xl pointer-events-none" />
                )}
              </motion.div>

              {/* Mensual */}
              <motion.div 
                className={cn(
                  "relative rounded-xl border-2 bg-white p-3 flex items-center justify-between cursor-pointer transition-all",
                  selectedPlan === 'monthly' ? "border-primary shadow-sm ring-1 ring-primary/20" : "border-transparent shadow-sm opacity-90"
                )}
                onClick={() => setSelectedPlan('monthly')}
                whileTap={{ scale: 0.99 }}
              >
                <span className="text-sm font-bold text-foreground">Mensual</span>
                <span className="text-base font-bold text-foreground">$9.00<span className="text-xs font-normal text-muted-foreground">/mes</span></span>
              </motion.div>
            </div>
          </div>

          {/* Footer Fijo */}
          <div className="p-4 pt-2 pb-6 bg-[#FAF9F6] shrink-0">
            <Button 
              size="lg" 
              className="w-full h-12 text-base font-bold rounded-full shadow-xl shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90 transition-transform active:scale-95"
              onClick={handleUnlock}
            >
              Continuar
            </Button>
            
            <div className="mt-3 flex justify-center gap-4 text-[10px] text-muted-foreground/70">
              <button className="hover:text-foreground hover:underline">Términos</button>
              <button className="hover:text-foreground hover:underline">Privacidad</button>
              <button className="hover:text-foreground hover:underline">Restaurar</button>
            </div>
            
            <div className="mt-2 text-center">
               <button onClick={onClose} className="text-[10px] text-muted-foreground/50 font-medium hover:text-foreground p-2 transition-colors">
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