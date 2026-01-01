import { useState, useMemo } from "react";
import { Home, User, LineChart, Book, Plus, Scan, Dumbbell, FileText, Scale, Droplets, X, ChevronDown } from "lucide-react";
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

const BottomNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWeightDrawerOpen, setIsWeightDrawerOpen] = useState(false);
  const [isWaterDrawerOpen, setIsWaterDrawerOpen] = useState(false);
  
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile, user } = useAuth();
  const { addWaterGlass } = useNutrition();

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

  const handleMenuAction = (action: () => void) => {
    setIsMenuOpen(false);
    setTimeout(() => {
      action();
    }, 150);
  };

  const handleOpenWeight = () => {
    if (hasReachedDailyWeightUpdateLimit) {
      toast.info(t('progress.weight_updated_today', 'Has alcanzado el límite diario de actualizaciones de peso.'));
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

  // Botones Circulares (Fila superior)
  const circularButtons = [
    { 
      label: t('bottom_nav.scan_food'), 
      icon: Scan, 
      action: () => handleMenuAction(() => navigate("/scanner", { state: { mode: 'food' } })) 
    },
    { 
      label: t('bottom_nav.scan_menu'), 
      icon: FileText, 
      action: () => handleMenuAction(() => navigate("/scanner", { state: { mode: 'menu' } })) 
    },
  ];

  return (
    <>
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Bottom Sheet Menu - Fixed Position */}
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

              {/* Top Row: Circular Buttons */}
              <div className="flex justify-center gap-10 mb-8">
                {circularButtons.map((btn, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <button
                      onClick={btn.action}
                      className="w-16 h-16 rounded-full bg-white dark:bg-muted shadow-sm border-2 border-primary/10 flex items-center justify-center text-primary active:scale-95 transition-transform"
                    >
                      <btn.icon className="w-7 h-7" strokeWidth={2} />
                    </button>
                    <span className="text-xs font-semibold text-foreground/80 text-center max-w-[80px] leading-tight">
                      {btn.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Separator Line */}
              <div className="h-px w-full bg-border/60 mb-6" />

              {/* Bottom Rows: Compact Buttons */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleOpenWeight}
                    disabled={hasReachedDailyWeightUpdateLimit}
                    className={cn(
                      "flex items-center justify-center gap-2 p-3 rounded-xl transition-all border shadow-sm active:scale-[0.98]",
                      hasReachedDailyWeightUpdateLimit 
                        ? "bg-muted/10 text-muted-foreground/50 border-border/10 cursor-not-allowed" 
                        : "bg-white dark:bg-muted border-border/40 text-foreground hover:border-primary/30"
                    )}
                  >
                    <Scale className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold">
                      {hasReachedDailyWeightUpdateLimit ? t('progress.updated_today', 'Hoy OK') : t('bottom_nav.log_weight', 'Peso')}
                    </span>
                  </button>

                  <button
                    onClick={() => handleMenuAction(() => navigate("/exercise"))}
                    className="flex items-center justify-center gap-2 p-3 bg-white dark:bg-muted rounded-xl shadow-sm border border-border/40 active:scale-[0.98] transition-all hover:border-primary/30"
                  >
                    <Dumbbell className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground">
                      {t('bottom_nav.log_exercise', 'Ejercicio')}
                    </span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleOpenWater}
                    className="flex items-center justify-center gap-2 p-3 bg-white dark:bg-muted rounded-xl shadow-sm border border-border/40 active:scale-[0.98] transition-all hover:border-primary/30"
                  >
                    <Droplets className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground">{t('bottom_nav.log_water', 'Agua')}</span>
                  </button>
                  
                  {/* Close Button in grid */}
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-muted/20 hover:bg-muted/30 border border-transparent text-muted-foreground active:scale-[0.98] transition-all"
                  >
                    <ChevronDown className="w-4 h-4" />
                    <span className="text-xs font-semibold">{t('analysis.close', 'Cerrar')}</span>
                  </button>
                </div>
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
                isMenuOpen ? "bg-background text-foreground border-2 border-muted" : "bg-primary text-primary-foreground"
              )}
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú de acciones"}
            >
              <Plus className={cn("w-7 h-7 transition-transform duration-300", isMenuOpen && "rotate-45 text-muted-foreground")} />
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
    </>
  );
};

export default BottomNav;