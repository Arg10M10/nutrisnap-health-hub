import { Home, Dumbbell, Target, Book, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { NavLink } from "./NavLink";
import { cn } from "@/lib/utils";

const BottomNav = () => {
  const navItems = [
    { icon: Home, label: "Inicio", path: "/" },
    { icon: Dumbbell, label: "Ejercicios", path: "/exercises" },
    { icon: Target, label: "Misiones", path: "/missions" },
    { icon: Book, label: "Dietas", path: "/diets" },
  ];

  const NavItem = ({ item }: { item: typeof navItems[0] }) => (
    <NavLink
      to={item.path}
      className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-colors min-w-[60px]"
      activeClassName="bg-primary/10 text-primary"
    >
      {({ isActive }) => (
        <>
          <item.icon className={cn("w-6 h-6", isActive ? "text-primary" : "text-muted-foreground")} />
          <span className={cn("text-xs font-medium", isActive ? "text-primary" : "text-muted-foreground")}>
            {item.label}
          </span>
        </>
      )}
    </NavLink>
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="relative max-w-2xl mx-auto">
        {/* Botón de Acción Flotante (FAB) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <Link
            to="/scanner"
            className="flex items-center justify-center w-16 h-16 bg-primary rounded-full shadow-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Escanear comida"
          >
            <Plus className="w-8 h-8 text-primary-foreground" />
          </Link>
        </div>

        {/* Fondo de la barra de navegación */}
        <div className="bg-card border-t border-border h-20">
          <div className="flex justify-around items-center h-full px-2">
            {/* Enlaces de la izquierda */}
            <div className="flex justify-around w-full">
              {navItems.slice(0, 2).map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </div>

            {/* Espaciador para el FAB */}
            <div className="w-20 flex-shrink-0" />

            {/* Enlaces de la derecha */}
            <div className="flex justify-around w-full">
              {navItems.slice(2, 4).map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;