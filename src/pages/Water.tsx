import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Plus, Droplets, Coffee, CupSoda, Milk, Wine } from "lucide-react";
import { useNutrition } from "@/context/NutritionContext";
import { useAuth } from "@/context/AuthContext";
import AnimatedNumber from "@/components/AnimatedNumber";
import PageLayout from "@/components/PageLayout";
import EditGoalWeightDrawer from "@/components/EditGoalWeightDrawer"; // Reusing or create a specific one? Let's use a simple drawer or input.
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import WheelPicker from "@/components/WheelPicker";
import { toast } from "sonner";

// Beverage types configuration
const beverages = [
  { id: 'water', labelKey: 'water.type_water', amount: 8, color: 'bg-blue-500', icon: Droplets, lightColor: 'bg-blue-100', textColor: 'text-blue-600' },
  { id: 'juice', labelKey: 'water.type_juice', amount: 8, color: 'bg-orange-500', icon: CupSoda, lightColor: 'bg-orange-100', textColor: 'text-orange-600' },
  { id: 'tea', labelKey: 'water.type_tea', amount: 8, color: 'bg-green-500', icon: CupSoda, lightColor: 'bg-green-100', textColor: 'text-green-600' },
  { id: 'coffee', labelKey: 'water.type_coffee', amount: 8, color: 'bg-amber-700', icon: Coffee, lightColor: 'bg-amber-100', textColor: 'text-amber-700' },
  { id: 'milk', labelKey: 'water.type_milk', amount: 8, color: 'bg-indigo-400', icon: Milk, lightColor: 'bg-indigo-100', textColor: 'text-indigo-600' },
  { id: 'soda', labelKey: 'water.type_soda', amount: 12, color: 'bg-red-500', icon: Wine, lightColor: 'bg-red-100', textColor: 'text-red-600' },
];

const Water = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getDataForDate, addWaterGlass } = useNutrition();
  const { profile } = useAuth(); // To save goal if we edit it
  
  // State
  const [selectedDate] = useState(new Date());
  const { waterIntake } = getDataForDate(selectedDate);
  const [isGoalDrawerOpen, setIsGoalDrawerOpen] = useState(false);
  
  // Default goal logic (could be moved to context/profile properly later)
  const [goal, setGoal] = useState(64); // Default 64oz

  // Effect to sync visual fill with actual data
  const percentage = Math.min((waterIntake / goal) * 100, 100);
  const remaining = Math.max(0, goal - waterIntake);

  const handleAddBeverage = (amount: number, name: string) => {
    addWaterGlass(new Date(), amount);
    toast.success(t('water.added_toast', { amount, name }));
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
          {/* Glass Container */}
          <div className="relative w-[240px] h-[340px]">
            {/* Glass Shape (Background) */}
            <div 
              className="absolute inset-0 bg-white dark:bg-muted/30 border-4 border-white/50 dark:border-white/10 shadow-xl backdrop-blur-sm z-20 pointer-events-none"
              style={{
                borderRadius: '10px 10px 80px 80px',
                clipPath: 'polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%)' // Tapered look
              }}
            />
            
            {/* Liquid Fill */}
            <div 
              className="absolute bottom-0 left-0 right-0 bg-blue-400 dark:bg-blue-500 transition-all duration-1000 ease-out z-10"
              style={{
                height: `${percentage}%`,
                borderRadius: '0 0 80px 80px',
                clipPath: 'polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%)', // Match glass taper
                opacity: 0.8
              }}
            >
              {/* Waves/Bubbles effect could go here */}
              <div className="absolute top-0 left-0 right-0 h-4 bg-white/30 skew-y-3 blur-md" />
            </div>

            {/* Glass Highlight/Reflection */}
            <div 
              className="absolute top-4 right-8 w-2 h-3/4 bg-gradient-to-b from-white/40 to-transparent rounded-full z-30 pointer-events-none blur-[1px]"
            />
          </div>
        </div>

        {/* Beverage Grid */}
        <div className="w-full mt-auto pt-8">
          <div className="grid grid-cols-4 gap-3">
            {beverages.map((bev) => (
              <motion.button
                key={bev.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleAddBeverage(bev.amount, t(bev.labelKey as any))}
                className="flex flex-col items-center gap-2 group"
              >
                <div className={`w-full aspect-[4/5] rounded-2xl ${bev.lightColor} dark:bg-muted flex flex-col items-center justify-end pb-3 relative overflow-hidden transition-shadow shadow-sm hover:shadow-md`}>
                  {/* Icon centered/floating */}
                  <div className="absolute inset-0 flex items-center justify-center pb-4">
                    <bev.icon className={`w-8 h-8 ${bev.textColor}`} strokeWidth={2.5} />
                  </div>
                  
                  {/* Plus button at bottom */}
                  <div className={`w-6 h-6 rounded-full ${bev.color} text-white flex items-center justify-center shadow-sm`}>
                    <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                  </div>
                </div>
                <span className="text-xs font-medium text-foreground/80">{t(bev.labelKey as any)}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Goal Drawer (Simple Implementation) */}
      <Drawer open={isGoalDrawerOpen} onOpenChange={setIsGoalDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-center">{t('water.edit_goal_title')}</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pb-8 flex justify-center">
             {/* Reusing WheelPicker logic simplified */}
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