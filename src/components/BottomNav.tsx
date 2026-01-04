import { useState, useMemo } from "react";
import { Home, User, LineChart, Book, Plus, Scan, Dumbbell, FileText, Scale, Droplets, ChevronDown, Utensils, ChefHat } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavLink } from "./NavLink";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import EditWeightDrawer from "@/components/EditWeightDrawer";
import { WaterSelectionDrawer } from "@/components/WaterSelectionDrawer";
import { useAuth } from "@/context/AuthContext";
import { useNutrition } from "@/context/NutritionContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay } from "date-fns";
import { toast } from "sonner";
import ManualFoodDrawer from "@/components/ManualFoodDrawer";
import { useAILimit } from "@/hooks/useAILimit";

const BottomNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWeightDrawerOpen, setIsWeightDrawerOpen] = useState(false);
  const [isWaterDrawerOpen, setIsWaterDrawerOpen] = useState(false);
  const [isManualFoodDrawerOpen, setIsManualFoodDrawerOpen] = useState(false);
  
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile, user } = useAuth();
  const { addWaterGlass } = useNutrition();
  const { checkLimit } = useAILimit();

  const { data: todaysWeightUpdatesCount } = useQuery({
    queryKey: ['todays_weight_updates_count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const todayStart = startOfDay(new Date()).toISOString();
      const { count, error } = await supabase
        .from('weight_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', todayStart);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user,
  });

  const hasReachedDailyWeightUpdateLimit = useMemo(() => {
    return (todaysWeightUpdatesCount ?? 0) >= 2;
  }, [todaysWeightUpdatesCount]);

  const navItems = [
    { icon: Home, label: t('bottom_nav.home'), path: "/" },
    { icon: User, label: t('bottom_nav.profile'), path: "/settings" },
    { icon: LineChart, label: t('bottom_nav.progress'), path: "/progress" },
    { icon: Book, label: t('bottom_nav.diets'), path: "/diets" },
  ];

  // Helper to check limit before action
  const handleProtectedAction = async (feature: 'food_scan' | 'manual_food_scan', action: () => void) => {
    // Check limit (which checks guest status)
    // Note: We use an arbitrary high limit here just to trigger the guest check
    const allowed = await checkLimit(feature, 9999, 'daily');
    if (allowed) {
      handleMenuAction(action);
    } else {
      setIsMenuOpen(false);
    }
  };

  const circularButtons = [
    { 
      label: t('bottom_nav.scan_food'), 
      icon: Scan, 
      action: () => handleProtectedAction('food_scan', () => navigate("/scanner", { state: { mode: 'food' } }))
    },
    { 
      label: t('bottom_nav.describe_food'), 
      icon: Utensils, 
      action: () => handleProtectedAction('manual_food_scan', () => setIsManualFoodDrawerOpen(true)) 
    },
    { 
      label: t('bottom_nav.scan_menu'), 
      icon: FileText, 
      action: () => handleProtectedAction('food_scan', () => navigate("/scanner", { state: { mode: 'menu' } })) 
    },
    { 
      label: t('bottom_nav.recipes', 'Recetas'), 
      icon: ChefHat, 
      action: () => handleMenuAction(() => navigate("/recipes")) // Recipes are allowed
    },
  ];

  const handleMenuAction = (action: () => void) => {
    setIsMenuOpen(false);
    setTimeout(() => {
      action();
    }, 150);
  };

  const handleOpenWeight = async () => {
    if (hasReachedDailyWeightUpdateLimit) {
      toast.info(t('progress.weight_updated_today', 'Has alcanzado el límite diario de actualizaciones de peso.'));
      return;
    }

    // Gate the weight logging feature for guests
    const allowed = await checkLimit('weight_log', 9999, 'daily');
    if (!allowed) {
        setIsMenuOpen(false);
        return;
    }

    setIsMenuOpen(false);
    setIsWeightDrawerOpen(true);
  };

  const handleOpenWater = () => {
    setIsMenuOpen(false);
    setIsWaterDrawerOpen(true);
  };

  const handleAddWater = (amount: number) => {
    addWaterGlass(new Date(), amount);
  };

  const NavItem = ({ item }: { item: typeof navItems[0] }) => (
    <NavLink
      id={`nav-${item.path.replace('/', '') || 'home'}`}
      to={item.path}
      className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-colors flex-shrink-0 w-1/5"
      activeClassName="bg-primary/10 text-primary"
      onClick={() => setIsMenuOpen(false)}
    >
      {({ isActive }) => (
        <>
          <item.icon className={cn("w-[22px] h-[22px]", isActive ? "text-primary" : "text-muted-foreground")} />
          <span className={cn("text-[11px] leading-tight font-medium", isActive ? "text-primary" : "text-muted-foreground")}>
            {item.label}
          </span>
        </>
      )}
    </NavLink>
  );

  const isImperial = profile?.units === 'imperial';
  const currentWeight = isImperial && profile?.weight ? Math.round(profile.weight * 2.20462) : (profile?.weight || 70);

  return (
    <>
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
            />
            
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) setIsMenuOpen(false);
              }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#FAF9F6] dark:bg-card rounded-t-[32px] p-6 pb-8 shadow-2xl border-t border-border/10"
            >
              {/* Drag Handle */}
              <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full mx-auto mb-6" />

              {/* Top Row: Circular Buttons (Main Actions) */}
              <div className="grid grid-cols-2 gap-x-10 gap-y-5 justify-items-center mb-6 px-4">
                {circularButtons.map((btn, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <button
                      onClick={btn.action}
                      className="w-16 h-16 rounded-full bg-white dark:bg-muted shadow-lg border-4 border-primary/5 flex items-center justify-center text-primary active:scale-95 transition-transform"
                    >
                      <btn.icon className="w-7 h-7" strokeWidth={2} />
                    </button>
                    <span className="text-xs font-bold text-foreground/80 text-center leading-tight max-w-[90px]">
                      {btn.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="h-px w-full bg-border/60 mb-6" />

              {/* Middle Row: Small Secondary Buttons (Centered) */}
              <div className="grid grid-cols-3 gap-3 mb-8 px-4">
                <button
                  onClick={handleOpenWeight}
                  disabled={hasReachedDailyWeightUpdateLimit}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 p-2 rounded-2xl transition-all border shadow-sm active:scale-95 bg-white dark:bg-muted/50 border-border/40 aspect-square",
                    hasReachedDailyWeightUpdateLimit && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Scale className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold text-foreground text-center leading-tight">
                    {hasReachedDailyWeightUpdateLimit ? t('progress.updated_today', 'Hoy OK') : t('bottom_nav.log_weight', 'Peso')}
                  </span>
                </button>

                <button
                  onClick={() => handleMenuAction(() => navigate("/exercise"))}
                  className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-2xl transition-all border shadow-sm active:scale-95 bg-white dark:bg-muted/50 border-border/40 aspect-square"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold text-foreground text-center leading-tight">
                    {t('bottom_nav.log_exercise', 'Ejercicio')}
                  </span>
                </button>

                <button
                  onClick={handleOpenWater}
                  className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-2xl transition-all border shadow-sm active:scale-95 bg-white dark:bg-muted/50 border-border/40 aspect-square"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold text-foreground text-center leading-tight">
                    {t('bottom_nav.log_water', 'Agua')}
                  </span>
                </button>
              </div>

              {/* Bottom: Close Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-muted/30 hover:bg-muted/50 text-muted-foreground font-medium transition-all active:scale-95 text-sm"
                >
                  <ChevronDown className="w-4 h-4" />
                  {t('analysis.close', 'Cerrar')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-40 p-4">
        <div className="relative max-w-2xl mx-auto">
          
          <div id="scan-action-button" className="absolute bottom-5 left-1/2 -translate-x-1/2 z-50">
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                isMenuOpen ? "bg-background text-foreground border-2 border-muted rotate-45" : "bg-primary text-primary-foreground"
              )}
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú de acciones"}
            >
              <Plus className="w-7 h-7" />
            </motion.button>
          </div>

          <div className="bg-card/95 backdrop-blur-md border border-border/50 h-[65px] rounded-full shadow-lg supports-[backdrop-filter]:bg-card/80">
            <div className="flex justify-around items-center h-full px-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
              {navItems.slice(0, 2).map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
              <div className="w-16 flex-shrink-0" />
              {navItems.slice(2, 4).map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </div>
          </div>
        </div>
      </nav>

      <EditWeightDrawer 
        isOpen={isWeightDrawerOpen} 
        onClose={() => setIsWeightDrawerOpen(false)} 
        currentWeight={currentWeight}
      />

      <WaterSelectionDrawer 
        isOpen={isWaterDrawerOpen}
        onClose={() => setIsWaterDrawerOpen(false)}
        onAdd={handleAddWater}
      />

      <ManualFoodDrawer
        isOpen={isManualFoodDrawerOpen}
        onClose={() => setIsManualFoodDrawerOpen(false)}
      />
    </>
  );
};

export default BottomNav;