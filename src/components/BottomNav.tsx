import { useState, useMemo } from "react";
import { Home, User, LineChart, Book, Plus, Scan, Dumbbell, FileText, Scale, Droplets } from "lucide-react";
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

  // Consulta para contar las actualizaciones de peso de hoy
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

  const menuItems = [
    { icon: Scan, label: t('bottom_nav.scan_food'), action: () => navigate("/scanner", { state: { mode: 'food' } }) },
    { icon: FileText, label: t('bottom_nav.scan_menu'), action: () => navigate("/scanner", { state: { mode: 'menu' } }) },
    { icon: Dumbbell, label: t('bottom_nav.log_exercise'), action: () => navigate("/exercise") },
  ];

  const handleMenuAction = (action: () => void) => {
    setIsMenuOpen(false);
    setTimeout(() => {
      action();
    }, 50);
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

  return (
    <>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-[2px]"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-50 p-4">
        <div className="relative max-w-2xl mx-auto">
          
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 10, x: "-50%" }}
                animate={{ scale: 1, opacity: 1, y: 0, x: "-50%" }}
                exit={{ scale: 0.9, opacity: 0, y: 10, x: "-50%" }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute bottom-28 left-1/2 w-[95%] max-w-[380px] bg-card border border-border/50 rounded-[2rem] shadow-2xl p-6 flex flex-col gap-4 z-50 origin-bottom"
              >
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-card rotate-45 border-b border-r border-border/50"></div>
                
                {/* Grid de botones principales */}
                <div className="grid grid-cols-3 gap-4">
                  {menuItems.map((mi) => (
                    <button
                      key={mi.label}
                      onClick={() => handleMenuAction(mi.action)}
                      className="flex flex-col items-center justify-center gap-3 p-3 rounded-2xl bg-muted/40 hover:bg-muted active:scale-95 transition-all cursor-pointer aspect-square border border-transparent hover:border-border/50"
                    >
                      <div className="bg-background p-4 rounded-full shadow-sm text-primary ring-1 ring-border/10">
                        <mi.icon className="w-8 h-8" />
                      </div>
                      <span className="text-sm font-semibold text-center text-foreground leading-tight px-1">{mi.label}</span>
                    </button>
                  ))}
                </div>

                {/* Botones pequeños de acción rápida (Peso y Agua) */}
                <div className="grid grid-cols-2 gap-3 w-full">
                  <button
                    onClick={handleOpenWeight}
                    disabled={hasReachedDailyWeightUpdateLimit}
                    className={cn(
                      "flex items-center justify-center gap-2 p-3 rounded-xl transition-all border",
                      hasReachedDailyWeightUpdateLimit 
                        ? "bg-muted/10 text-muted-foreground/50 border-border/10 cursor-not-allowed" 
                        : "bg-muted/30 hover:bg-muted active:scale-95 border-border/30 text-muted-foreground"
                    )}
                  >
                    <Scale className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {hasReachedDailyWeightUpdateLimit ? t('progress.updated_today', 'Hoy OK') : t('bottom_nav.log_weight', 'Peso')}
                    </span>
                  </button>

                  <button
                    onClick={handleOpenWater}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 active:scale-95 transition-all border border-blue-500/20"
                  >
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{t('bottom_nav.log_water', 'Agua')}</span>
                  </button>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

          <div id="scan-action-button" className="absolute bottom-5 left-1/2 -translate-x-1/2 z-50">
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                isMenuOpen ? "bg-foreground text-background rotate-45" : "bg-primary text-primary-foreground"
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
    </>
  );
};

export default BottomNav;