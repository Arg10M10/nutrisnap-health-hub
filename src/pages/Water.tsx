import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Plus, Droplets, Coffee, CupSoda } from "lucide-react";
import { useNutrition } from "@/context/NutritionContext";
import { useAuth } from "@/context/AuthContext";
import AnimatedNumber from "@/components/AnimatedNumber";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { toast } from "sonner";
import WaterEntryDrawer from "@/components/WaterEntryDrawer";

// Beverage types configuration with Hydration Rates (Removed Milk & Soda)
const beverages = [
  { id: 'water', labelKey: 'water.type_water', rate: 1.0, color: 'text-blue-500', icon: Droplets, bgColor: 'bg-blue-100', borderColor: 'border-blue-200' },
  { id: 'juice', labelKey: 'water.type_juice', rate: 0.9, color: 'text-orange-500', icon: CupSoda, bgColor: 'bg-orange-100', borderColor: 'border-orange-200' },
  { id: 'tea', labelKey: 'water.type_tea', rate: 0.9, color: 'text-green-600', icon: CupSoda, bgColor: 'bg-green-100', borderColor: 'border-green-200' },
  { id: 'coffee', labelKey: 'water.type_coffee', rate: 0.7, color: 'text-amber-700', icon: Coffee, bgColor: 'bg-amber-100', borderColor: 'border-amber-200' },
];

const Water = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getDataForDate, addWaterGlass } = useNutrition();
  
  // State
  const [selectedDate] = useState(new Date());
  const { waterIntake } = getDataForDate(selectedDate);
  const [isGoalDrawerOpen, setIsGoalDrawerOpen] = useState(false);
  const [selectedBeverage, setSelectedBeverage] = useState<any>(null);
  
  // Default goal logic
  const [goal, setGoal] = useState(64); // Default 64oz

  // Effect to sync visual fill with actual data
  const percentage = Math.min((waterIntake / goal) * 100, 100);
  const remaining = Math.max(0, goal - waterIntake);

  const handleBeverageClick = (bev: typeof beverages[0]) => {
    setSelectedBeverage({
        ...bev,
        label: t(bev.labelKey as any)
    });
  };

  const handleConfirmAdd = (amount: number) => {
    if (!selectedBeverage) return;
    
    // Calculate effective hydration based on rate
    const hydrationAmount = amount * selectedBeverage.rate;
    
    addWaterGlass(new Date(), hydrationAmount);
    
    toast.success(t('water.added_toast', { amount: amount, name: selectedBeverage.label }), {
        description: selectedBeverage.rate < 1 ? `Hidratación efectiva: ${hydrationAmount.toFixed(1)} oz` : undefined
    });
    
    setSelectedBeverage(null);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 pt-6 flex items-center justify-between relative z-10">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-muted/20">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </Button>
        <span className="font-semibold text-lg opacity-0">Water</span>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <div className="flex-1 flex flex-col items-center w-full max-w-md mx-auto px-6 pb-8">
        
        {/* Main Stats */}
        <div className="text-center mb-8 space-y-1">
          <div className="flex items-end justify-center gap-1 text-blue-500 dark:text-blue-400">
            <span className="text-6xl font-bold tracking-tighter">
              <AnimatedNumber value={waterIntake} toFixed={1} />
            </span>
            <span className="text-2xl font-medium mb-1.5">oz</span>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm font-medium">
            <span>
              {t('water.remaining')} {remaining.toFixed(1)} oz
            </span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            <button 
              onClick={() => setIsGoalDrawerOpen(true)}
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              {t('water.goal')} {goal} oz
              <Pencil className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* The Big Glass */}
        <div className="flex-1 w-full flex items-center justify-center py-4 relative">
          <div className="relative w-[240px] h-[340px]">
            {/* 
               CONTENEDOR DE FORMA (MASK)
               Aquí definimos la forma del vaso y ocultamos lo que se salga (overflow-hidden).
               El líquido sube dentro de esto sin deformarse.
            */}
            <div 
              className="absolute inset-0 z-10 overflow-hidden bg-white/40 dark:bg-white/5 backdrop-blur-sm border-4 border-white/60 dark:border-white/20 shadow-xl"
              style={{
                borderRadius: '10px 10px 80px 80px',
                // Usamos un clip-path ligeramente trapezoidal para dar efecto de vaso
                clipPath: 'polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%)' 
              }}
            >
                {/* Liquid Fill - Sube desde abajo */}
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-blue-400 dark:bg-blue-500 transition-all duration-1000 ease-out"
                  style={{
                    height: `${percentage}%`,
                    width: '100%',
                    opacity: 0.85
                  }}
                >
                  {/* Efecto de superficie del agua */}
                  <div className="absolute top-0 left-0 right-0 h-2 bg-white/40 skew-y-1" />
                </div>
            </div>

            {/* Glass Highlight/Reflection (Cosmético encima del vaso) */}
            <div 
              className="absolute top-4 right-8 w-3 h-3/4 bg-gradient-to-b from-white/30 to-transparent rounded-full z-20 pointer-events-none blur-[2px]"
            />
          </div>
        </div>

        {/* Beverage Grid (2 columnas para 4 items se ve mejor) */}
        <div className="w-full mt-auto pt-8">
          <div className="grid grid-cols-2 gap-4 max-w-[300px] mx-auto">
            {beverages.map((bev) => (
              <motion.button
                key={bev.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleBeverageClick(bev)}
                className="flex flex-col items-center gap-2 group"
              >
                <div className={`w-full h-24 rounded-2xl ${bev.bgColor} border ${bev.borderColor} dark:bg-muted flex items-center justify-center relative overflow-hidden transition-all shadow-sm hover:shadow-md hover:-translate-y-1`}>
                  
                  {/* Rate Badge (Top Right) */}
                  {bev.rate < 1 && (
                    <div className="absolute top-2 right-2 bg-white/50 dark:bg-black/20 px-1.5 py-0.5 rounded-md text-[10px] font-bold text-foreground/70">
                        {Math.round(bev.rate * 100)}%
                    </div>
                  )}

                  <bev.icon className={`w-10 h-10 ${bev.color}`} strokeWidth={2} />
                  
                  {/* Plus icon subtle */}
                  <div className={`absolute bottom-2 right-2 w-5 h-5 rounded-full bg-white text-${bev.color.split('-')[1]}-500 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity`}>
                    <Plus className="w-3 h-3" strokeWidth={3} />
                  </div>
                </div>
                <span className="text-sm font-medium text-foreground/80">{t(bev.labelKey as any)}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Entry Drawer */}
      <WaterEntryDrawer 
        isOpen={!!selectedBeverage}
        onClose={() => setSelectedBeverage(null)}
        beverage={selectedBeverage}
        onConfirm={handleConfirmAdd}
      />

      {/* Edit Goal Drawer */}
      <Drawer open={isGoalDrawerOpen} onOpenChange={setIsGoalDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-center">{t('water.edit_goal_title')}</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pb-8 flex justify-center">
             <div className="flex items-center gap-2">
                <Button onClick={() => setGoal(Math.max(10, goal - 5))} variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
                <span className="text-4xl font-bold w-24 text-center">{goal}</span>
                <Button onClick={() => setGoal(goal + 5)} variant="outline" size="icon"><Plus className="w-4 h-4" /></Button>
                <span className="text-xl text-muted-foreground">oz</span>
             </div>
          </div>
          <DrawerFooter>
            <Button onClick={() => setIsGoalDrawerOpen(false)} className="w-full h-12 rounded-xl text-lg">
                {t('common.continue')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Water;