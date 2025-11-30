import { Home, Dumbbell, LineChart, Book, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { NavLink } from "./NavLink";
import { cn } from "@/lib/utils";

const BottomNav = () => {
  const navItems = [
    { icon: Home, label: "Inicio", path: "/" },
    { icon: Dumbbell, label: "Ejercicios", path: "/exercises" },
    { icon: LineChart, label: "Progreso", path: "/progress" },
    { icon: Book, label: "Dietas", path: "/diets" },
  ];

  const NavItem = ({ item }: { item: typeof navItems[0] }) => (
    <NavLink
      to={item.path}
      className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-colors flex-shrink-0 w-1/5"
      activeClassName="bg-primary/10 text-primary"
    >
      {({ isActive }) => (
        <>
          {/* Usamos tamaño en píxeles para evitar que escale con la accesibilidad */}
          <item.icon className={cn("w-[24px] h-[24px]", isActive ? "text-primary" : "text-muted-foreground")} />
          {/* Tamaño de fuente y altura de línea fijos */}
          <span className={cn("text-[12px] leading-tight font-medium", isActive ? "text-primary" : "text-muted-foreground")}>
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

        {/* Fondo de la barra de navegación con altura fija y scroll horizontal */}
        <div className="bg-card border-t border-border h-[70px] max-h-[70px]">
          {/* Contenedor scrollable que oculta la barra de scroll */}
          <div className="flex justify-around items-center h-full px-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
            {navItems.slice(0, 2).map((item) => (
              <NavItem key={item.path} item={item} />
            ))}

            {/* Espaciador para el FAB, también con flex-shrink-0 */}
            <div className="w-20 flex-shrink-0" />

            {navItems.slice(2, 4).map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;