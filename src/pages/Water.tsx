import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Plus, Droplets, Coffee, CupSoda, Lightbulb, ChevronRight, X, Info } from "lucide-react";
import { useNutrition } from "@/context/NutritionContext";
import { useAuth } from "@/context/AuthContext";
import AnimatedNumber from "@/components/AnimatedNumber";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { toast } from "sonner";
import WaterEntryDrawer from "@/components/WaterEntryDrawer";

// Beverage types configuration with Hydration Rates
const beverages = [
  { id: 'water', labelKey: 'water.type_water', rate: 1.0, color: 'text-blue-500', icon: Droplets, bgColor: 'bg-blue-50', borderColor: 'border-blue-100' },
  { id: 'juice', labelKey: 'water.type_juice', rate: 0.9, color: 'text-orange-500', icon: CupSoda, bgColor: 'bg-orange-50', borderColor: 'border-orange-100' },
  { id: 'tea', labelKey: 'water.type_tea', rate: 0.9, color: 'text-green-600', icon: CupSoda, bgColor: 'bg-green-50', borderColor: 'border-green-100' },
  { id: 'coffee', labelKey: 'water.type_coffee', rate: 0.7, color: 'text-amber-700', icon: Coffee, bgColor: 'bg-amber-50', borderColor: 'border-amber-100' },
];

const Water = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getDataForDate, addWaterGlass } = useNutrition();
  
  // State
  const [selectedDate] = useState(new Date());
  const { waterIntake } = getDataForDate(selectedDate);
  const [isGoalDrawerOpen, setIsGoalDrawerOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
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
    
    const hydrationAmount = amount * selectedBeverage.rate;
    
    addWaterGlass(new Date(), hydrationAmount);
    
    toast.success(t('water.added_toast', { amount: amount, name: selectedBeverage.label }), {
        description: selectedBeverage.rate < 1 ? `Hidratación efectiva: ${hydrationAmount.toFixed(1)} oz` : undefined
    });
    
    setSelectedBeverage(null);
  };

  const glassPath = "M 5 0 H 235 L 210 300 Q 205 340 160 340 H 80 Q 35 340 30 300 L 5 0 Z";

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 pt-6 flex items-center justify-between relative z-10">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-muted/20">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </Button>
        <span className="font-semibold text-lg opacity-0">Water</span>
        <div className="w-10" /> 
      </header>

      <div className="flex-1 flex flex-col items-center w-full max-w-md mx-auto px-6 pb-8 overflow-y-auto no-scrollbar">
        
        {/* Main Stats */}
        <div className="text-center mb-8 space-y-1 shrink-0">
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

        {/* Glass Visual */}
        <div className="flex-1 w-full flex items-center justify-center py-4 relative shrink-0 min-h-[360px]">
          <div className="relative w-[240px] h-[340px] drop-shadow-2xl scale-95 sm:scale-100 transition-transform">
            <svg 
              width="240" 
              height="340" 
              viewBox="0 0 240 340" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="overflow-visible"
            >
              <defs>
                <clipPath id="glassClip">
                  <path d={glassPath} />
                </clipPath>
                <linearGradient id="glassGradient" x1="120" y1="0" x2="120" y2="340" gradientUnits="userSpaceOnUse">
                  <stop stopColor="white" stopOpacity="0.4" />
                  <stop offset="1" stopColor="white" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id="liquidGradient" x1="120" y1="0" x2="120" y2="340" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#60A5FA" />
                  <stop offset="1" stopColor="#3B82F6" />
                </linearGradient>
              </defs>

              <path 
                d={glassPath} 
                fill="url(#glassGradient)" 
                stroke="rgba(255,255,255,0.6)" 
                strokeWidth="4" 
                className="drop-shadow-sm"
              />

              <g clipPath="url(#glassClip)">
                <rect 
                  x="0" 
                  y={340 - (340 * percentage / 100)} 
                  width="240" 
                  height="340" 
                  fill="url(#liquidGradient)" 
                  className="transition-all duration-1000 ease-out"
                  opacity="0.9"
                />
                
                <rect 
                  x="0" 
                  y={340 - (340 * percentage / 100)} 
                  width="240" 
                  height="4" 
                  fill="white" 
                  fillOpacity="0.4"
                  className="transition-all duration-1000 ease-out"
                />
                
                <circle cx="60" cy={340 - (340 * percentage / 100) + 40} r="4" fill="white" fillOpacity="0.3" />
                <circle cx="180" cy={340 - (340 * percentage / 100) + 80} r="6" fill="white" fillOpacity="0.2" />
                <circle cx="100" cy={340 - (340 * percentage / 100) + 120} r="3" fill="white" fillOpacity="0.3" />
              </g>

              <path 
                d="M 20 10 Q 30 100 45 300" 
                stroke="white" 
                strokeWidth="4" 
                strokeOpacity="0.3" 
                strokeLinecap="round"
                fill="none"
                style={{ filter: 'blur(2px)' }}
              />
              <path 
                d="M 220 10 Q 210 100 195 300" 
                stroke="white" 
                strokeWidth="2" 
                strokeOpacity="0.15" 
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
        </div>

        {/* Beverages Row */}
        <div className="w-full mt-2 pb-2 shrink-0">
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 justify-center sm:justify-start px-2">
            {beverages.map((bev) => (
              <motion.button
                key={bev.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleBeverageClick(bev)}
                className="flex flex-col items-center gap-2 group flex-shrink-0"
              >
                <div className={`w-16 h-16 rounded-full bg-white dark:bg-muted border ${bev.borderColor} flex items-center justify-center relative shadow-sm transition-all group-hover:shadow-md group-hover:scale-105 group-active:scale-95`}>
                  {bev.rate < 1 && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-white dark:bg-muted rounded-full flex items-center justify-center border border-muted">
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                    </div>
                  )}
                  <bev.icon className={`w-7 h-7 ${bev.color}`} strokeWidth={2} />
                  <div className="absolute inset-0 bg-black/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Plus className="w-6 h-6 text-white drop-shadow-md" strokeWidth={3} />
                  </div>
                </div>
                <span className="text-xs font-semibold text-foreground/70">{t(bev.labelKey as any)}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Smart Hydration Banner */}
        <div className="w-full max-w-sm mt-6">
          <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsGuideOpen(true)}
            className="bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl p-6 relative overflow-hidden cursor-pointer shadow-sm group"
          >
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10" />
            
            <div className="relative z-10 flex justify-between items-center">
              <div className="flex flex-col items-start gap-1">
                <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 leading-tight">
                  {t('water.guide.card_title')}
                </h3>
                <p className="text-sm text-emerald-800/80 dark:text-emerald-200/80 font-medium">
                  {t('water.guide.card_subtitle')}
                </p>
                <span className="mt-3 bg-emerald-900 text-white text-xs font-bold px-4 py-2 rounded-full inline-flex items-center gap-1 group-hover:bg-emerald-800 transition-colors">
                  {t('water.guide.read_more')} <ChevronRight className="w-3 h-3" />
                </span>
              </div>
              
              {/* Illustration Icon */}
              <div className="w-20 h-20 bg-white/40 dark:bg-emerald-800/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-inner">
                 <Lightbulb className="w-10 h-10 text-emerald-700 dark:text-emerald-200" />
              </div>
            </div>
          </motion.div>
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

      {/* Smart Hydration Guide Drawer */}
      <Drawer open={isGuideOpen} onOpenChange={setIsGuideOpen}>
        <DrawerContent className="h-[92vh] flex flex-col rounded-t-[32px] bg-[#FAF9F6] outline-none">
          <div className="absolute top-4 right-4 z-20">
            <Button variant="ghost" size="icon" onClick={() => setIsGuideOpen(false)} className="rounded-full bg-black/5 hover:bg-black/10">
              <X className="w-5 h-5 opacity-60" />
            </Button>
          </div>
          
          <div className="flex-1 flex flex-col w-full max-w-md mx-auto overflow-hidden">
            <div className="pt-8 px-6 pb-2 shrink-0 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                <Info className="w-8 h-8" />
              </div>
              <DrawerTitle className="text-2xl font-black text-foreground">{t('water.guide.title')}</DrawerTitle>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed px-4">
                {t('water.guide.intro')}
              </p>
            </div>

            {/* Added data-vaul-scrollable to allow native scrolling within the drawer */}
            <div className="flex-1 px-6 pb-8 pt-4 overflow-y-auto" data-vaul-scrollable>
              <div className="space-y-6">
                
                {/* Beverages Grid */}
                <div className="grid gap-4">
                  {/* Water */}
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-blue-500">
                      <Droplets className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-foreground">{t('water.guide.water_name').split(' — ')[0]}</h4>
                        <span className="text-xs font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">100%</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{t('water.guide.water_desc')}</p>
                    </div>
                  </div>

                  {/* Tea & Milk */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                          <CupSoda className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">90%</span>
                      </div>
                      <h4 className="font-bold text-sm mb-1">{t('water.guide.tea_name')}</h4>
                      <p className="text-[10px] text-muted-foreground leading-snug">{t('water.guide.tea_desc')}</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                          <CupSoda className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">90%</span>
                      </div>
                      <h4 className="font-bold text-sm mb-1">{t('water.guide.milk_name')}</h4>
                      <p className="text-[10px] text-muted-foreground leading-snug">{t('water.guide.milk_desc')}</p>
                    </div>
                  </div>

                  {/* Coffee */}
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center shrink-0 text-amber-700">
                      <Coffee className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-foreground">{t('water.guide.coffee_name')}</h4>
                        <span className="text-xs font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">70%</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{t('water.guide.coffee_desc')}</p>
                    </div>
                  </div>

                  {/* Avoid Section (Juice & Soda) */}
                  <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100">
                    <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider mb-3 ml-1">Limit Intake</h4>
                    <div className="space-y-3">
                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 text-orange-500 shadow-sm">
                          <CupSoda className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-baseline justify-between">
                            <span className="text-sm font-bold text-foreground">{t('water.guide.juice_name')}</span>
                            <span className="text-[10px] font-bold text-muted-foreground">90%</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">{t('water.guide.juice_desc')}</p>
                        </div>
                      </div>
                      <div className="w-full h-px bg-red-200/50" />
                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 text-purple-500 shadow-sm">
                          <CupSoda className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-baseline justify-between">
                            <span className="text-sm font-bold text-foreground">{t('water.guide.soda_name')}</span>
                            <span className="text-[10px] font-bold text-red-500">40%</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">{t('water.guide.soda_desc')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Practical Tips */}
                <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                  <h3 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" /> {t('water.guide.tips_title')}
                  </h3>
                  <ul className="space-y-2">
                    {[1, 2, 3, 4].map((num) => (
                      <li key={num} className="flex gap-2 items-start text-xs text-emerald-800 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        {t(`water.guide.tip_${num}` as any)}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Water;