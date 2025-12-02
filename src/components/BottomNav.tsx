import { useState } from "react";
import { Home, Settings, LineChart, Book, Plus, Scan, Dumbbell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "./NavLink";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
    action();
    setIsMenuOpen(false);
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
    <>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-black/60 z-40"
          />
        )}
      </AnimatePresence>
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="relative max-w-2xl mx-auto">
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-end gap-4"
              >
                {menuItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-3" style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="bg-card text-card-foreground px-4 py-2 rounded-lg shadow-md">
                      <span className="font-semibold">{item.label}</span>
                    </div>
                    <Button
                      size="icon"
                      className="w-12 h-12 rounded-full bg-card text-primary shadow-lg"
                      onClick={() => handleMenuAction(item.action)}
                    >
                      <item.icon className="w-6 h-6" />
                    </Button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center justify-center w-14 h-14 bg-primary rounded-full shadow-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="Abrir menú de acciones"
            >
              <motion.div animate={{ rotate: isMenuOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
                <Plus className="w-7 h-7 text-primary-foreground" />
              </motion.div>
            </motion.button>
          </div>

          <div className="bg-card border-t border-border h-[65px] max-h-[65px]">
            <div className="flex justify-around items-center h-full px-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
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
    </>
  );
};

export default BottomNav;