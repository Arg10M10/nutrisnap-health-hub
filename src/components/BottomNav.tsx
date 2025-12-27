import { useState } from "react";
import { Home, Settings, LineChart, Book, Plus, Scan, Dumbbell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavLink } from "./NavLink";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const BottomNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const navItems = [
    { icon: Home, label: t('bottom_nav.home'), path: "/" },
    { icon: Settings, label: t('bottom_nav.settings'), path: "/settings" },
    { icon: LineChart, label: t('bottom_nav.progress'), path: "/progress" },
    { icon: Book, label: t('bottom_nav.diets'), path: "/diets" },
  ];

  const menuItems = [
    { icon: Scan, label: t('bottom_nav.scan_food'), action: () => navigate("/scanner") },
    { icon: Dumbbell, label: t('bottom_nav.log_exercise'), action: () => navigate("/exercise") },
  ];

  const handleMenuAction = (action: () => void) => {
    setIsMenuOpen(false);
    // Pequeño delay para permitir que la animación de cierre comience
    setTimeout(() => {
      action();
    }, 50);
  };

  const NavItem = ({ item }: { item: typeof navItems[0] }) => (
    <NavLink
      id={`nav-${item.path.replace('/', '') || 'home'}`}
      to={item.path}
      className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-colors flex-shrink-0 w-1/5"
      activeClassName="bg-primary/10 text-primary"
      onClick={() => setIsMenuOpen(false)} // Cerrar menú si se navega
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

  return (
    <>
      {/* Backdrop para cerrar al hacer click fuera */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-[1px]"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-50 p-4">
        <div className="relative max-w-2xl mx-auto">
          
          {/* Menú Flotante */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64 bg-card border border-border/50 rounded-3xl shadow-2xl p-4 grid grid-cols-2 gap-4 z-50 origin-bottom"
              >
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-card rotate-45 border-b border-r border-border/50"></div>
                {menuItems.map((mi) => (
                  <button
                    key={mi.label}
                    onClick={() => handleMenuAction(mi.action)}
                    className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-muted/50 hover:bg-muted active:scale-95 transition-all cursor-pointer aspect-square"
                  >
                    <div className="bg-background p-2 rounded-full shadow-sm text-primary">
                      <mi.icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold text-center text-foreground leading-tight">{mi.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botón Central Flotante */}
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

          {/* Barra de Navegación */}
          <div className="bg-card/95 backdrop-blur-md border border-border/50 h-[65px] rounded-full shadow-lg supports-[backdrop-filter]:bg-card/80">
            <div className="flex justify-around items-center h-full px-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
              {navItems.slice(0, 2).map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
              <div className="w-16 flex-shrink-0" /> {/* Espaciador para el botón central */}
              {navItems.slice(2, 4).map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;