import { useState } from "react";
import { Home, Settings, LineChart, Book, Plus, Scan, Dumbbell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "./NavLink";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerTrigger, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

const BottomNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: "Inicio", path: "/" },
    { icon: Settings, label: "Configuración", path: "/settings" },
    { icon: LineChart, label: "Progreso", path: "/progress" },
    { icon: Book, label: "Dietas", path: "/diets" },
  ];

  const menuItems = [
    {
      icon: Scan,
      label: "Escanear Alimento",
      action: () => navigate("/scanner"),
    },
    {
      icon: Dumbbell,
      label: "Registrar Ejercicio",
      action: () => toast.info("Próximamente", { description: "La función de registro de ejercicios estará disponible pronto." }),
    },
  ];

  const handleMenuAction = (action: () => void) => {
    setIsMenuOpen(false);
    // Add a small delay to ensure the drawer has started closing before navigating.
    // This prevents a race condition that could leave the body scroll locked.
    setTimeout(() => {
      action();
    }, 100);
  };

  const NavItem = ({ item }: { item: typeof navItems[0] }) => (
    <NavLink
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
                whileTap={{ scale: 0.9 }}
                className="flex items-center justify-center w-14 h-14 bg-primary rounded-full shadow-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label="Abrir menú de acciones"
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
          <DrawerTitle>¿Qué quieres registrar?</DrawerTitle>
        </DrawerHeader>
        <div className="grid grid-cols-2 gap-4 p-4 pb-8">
          <div
            onClick={() => handleMenuAction(menuItems[0].action)}
            className="flex flex-col items-center justify-center gap-3 p-6 bg-muted rounded-2xl aspect-square cursor-pointer hover:bg-muted/80 transition-colors"
          >
            <Scan className="w-12 h-12 text-primary" />
            <span className="font-semibold text-center text-foreground text-lg">{menuItems[0].label}</span>
          </div>
          <div
            onClick={() => handleMenuAction(menuItems[1].action)}
            className="flex flex-col items-center justify-center gap-3 p-6 bg-muted rounded-2xl aspect-square cursor-pointer hover:bg-muted/80 transition-colors"
          >
            <Dumbbell className="w-12 h-12 text-primary" />
            <span className="font-semibold text-center text-foreground text-lg">{menuItems[1].label}</span>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default BottomNav;