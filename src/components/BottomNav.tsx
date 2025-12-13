import { useState } from "react";
import { Home, Settings, LineChart, Book, Plus, Scan, Dumbbell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavLink } from "./NavLink";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Drawer, DrawerContent, DrawerTrigger, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

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
    setTimeout(() => {
      action();
    }, 100);
  };

  const NavItem = ({ item }: { item: typeof navItems[0] }) => (
    <NavLink
      id={`nav-${item.path.replace('/', '') || 'home'}`}
      to={item.path}
      className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-colors flex-shrink-0 w-1/5"
      activeClassName="bg-primary/10 text-primary"
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
    <Drawer open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <nav className="fixed bottom-0 left-0 right-0 z-50 p-4">
        <div className="relative max-w-2xl mx-auto">
          <DrawerTrigger asChild>
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
              <motion.button
                id="scan-action-button"
                whileTap={{ scale: 0.9 }}
                className="flex items-center justify-center w-14 h-14 bg-primary rounded-full shadow-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label="Open actions menu"
              >
                <motion.div animate={{ rotate: isMenuOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
                  <Plus className="w-7 h-7 text-primary-foreground" />
                </motion.div>
              </motion.button>
            </div>
          </DrawerTrigger>

          <div className="bg-card border border-border h-[65px] rounded-full shadow-lg">
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
      <DrawerContent>
        <DrawerHeader className="text-center">
          <DrawerTitle>{t('bottom_nav.log_title')}</DrawerTitle>
        </DrawerHeader>
        <div className="grid grid-cols-2 gap-4 p-4 pb-8">
          {menuItems.map((mi) => (
            <div
              key={mi.label as string}
              onClick={() => handleMenuAction(mi.action)}
              className="flex flex-col items-center justify-center gap-3 p-6 bg-muted rounded-2xl aspect-square cursor-pointer hover:bg-muted/80 transition-colors"
            >
              <mi.icon className="w-12 h-12 text-primary" />
              <span className="font-semibold text-center text-foreground text-lg">{mi.label}</span>
            </div>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default BottomNav;