import { useState } from "react";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Check, X, Leaf, Star } from "lucide-react";
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
    // En un flujo real, aquí pasaríamos el plan seleccionado a la pasarela de pago
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
      <DrawerContent className="h-[95vh] rounded-t-[24px] bg-[#FAF9F6] outline-none">
        <div className="overflow-y-auto no-scrollbar pb-8">
          <div className="sr-only">
            <DrawerTitle>Calorel Premium</DrawerTitle>
          </div>
          
          {/* Header Section */}
          <div className="relative pt-8 px-6 pb-2 text-center">
            {/* Elemento decorativo esquina superior derecha (tipo zanahoria de la imagen) */}
            <div className="absolute top-0 right-0 opacity-20 pointer-events-none">
                <Leaf className="w-24 h-24 text-orange-500 rotate-[-45deg] -mr-8 -mt-4" fill="currentColor" />
            </div>

            <h2 className="text-2xl font-bold leading-tight text-foreground mb-2">
              Únete a <span className="text-orange-500 font-black">Calorel</span> premium para formar una mejor versión de ti.
            </h2>
            <p className="text-sm text-muted-foreground">
              Con Calorel premium, los usuarios logran su objetivo 3 veces más rápido.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="px-4 py-4">
            <div className="bg-white rounded-2xl shadow-sm border border-border/40 overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[1.5fr_1fr_1fr] border-b border-border/40">
                <div className="p-3"></div>
                <div className="p-3 text-center text-xs font-bold text-muted-foreground tracking-wider">GRATIS</div>
                <div className="p-3 text-center text-xs font-bold text-orange-600 tracking-wider bg-orange-50">PREMIUM</div>
              </div>

              {/* Rows */}
              {benefits.map((benefit, index) => (
                <div key={index} className="grid grid-cols-[1.5fr_1fr_1fr] border-b border-border/40 last:border-0 items-center">
                  <div className="p-3 text-xs font-medium text-foreground leading-tight">
                    {benefit.name}
                  </div>
                  <div className="p-2 flex justify-center">
                    {benefit.free ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-red-300" />
                    )}
                  </div>
                  <div className="p-2 flex justify-center bg-orange-50 h-full items-center">
                    {benefit.premium && (
                      <div className="bg-green-500 rounded-full p-0.5">
                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Options */}
          <div className="px-4 space-y-4 mb-4">
            {/* Annual Plan (Best Value) */}
            <motion.div 
              className={cn(
                "relative rounded-2xl border-2 overflow-hidden cursor-pointer transition-all shadow-md",
                selectedPlan === 'annual' ? "border-orange-500 bg-white" : "border-transparent bg-white shadow-sm"
              )}
              onClick={() => setSelectedPlan('annual')}
              whileTap={{ scale: 0.98 }}
            >
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-center py-1.5 text-sm font-bold tracking-wide">
                63% DTO
              </div>
              <div className="p-4 flex flex-col items-center">
                <p className="text-sm font-semibold text-foreground mb-1">Exclusivo para nuevos usuarios</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-foreground">$2.49</span>
                  <span className="text-muted-foreground font-medium">/mes</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-through opacity-60">$79.99</p>
                <p className="text-xs text-orange-600 font-bold mt-0.5">Total $29.99/año</p>
                
                {selectedPlan === 'annual' && (
                  <div className="absolute top-10 right-4 text-orange-500">
                    <div className="bg-orange-100 rounded-full p-1">
                      <Check className="w-4 h-4" />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Monthly Plan */}
            <motion.div 
              className={cn(
                "relative rounded-2xl border-2 bg-white p-4 flex items-center justify-between cursor-pointer transition-all",
                selectedPlan === 'monthly' ? "border-orange-500 shadow-md" : "border-border/50 shadow-sm"
              )}
              onClick={() => setSelectedPlan('monthly')}
              whileTap={{ scale: 0.98 }}
            >
              <span className="font-semibold text-foreground">1 mes</span>
              <span className="font-bold text-lg text-foreground">$19.99/mes</span>
              
              {selectedPlan === 'monthly' && (
                <div className="absolute top-1/2 -translate-y-1/2 right-4 text-orange-500">
                   <div className="bg-orange-100 rounded-full p-1">
                      <Check className="w-4 h-4" />
                    </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* CTA Section */}
          <div className="px-6 mt-6 pb-6">
            <Button 
              size="lg" 
              className="w-full h-14 text-lg font-bold rounded-full bg-[#0F172A] text-white hover:bg-[#1E293B] shadow-xl"
              onClick={handleUnlock}
            >
              ¡Reclama tu oferta limitada ahora!
            </Button>
            
            <p className="text-center text-[10px] text-muted-foreground mt-4 flex justify-center gap-4">
              <span className="cursor-pointer underline">Términos del servicio</span>
              <span className="cursor-pointer underline">Privacidad</span>
            </p>
            
            <div className="mt-4 text-center">
               <button onClick={onClose} className="text-xs text-muted-foreground/60 font-medium hover:text-foreground">
                 Cerrar y continuar como invitado
               </button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default PremiumLockDrawer;