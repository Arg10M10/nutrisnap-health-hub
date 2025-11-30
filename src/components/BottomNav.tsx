import { Home, Camera, Dumbbell, Target, Book } from "lucide-react";
import { NavLink } from "./NavLink";
import { cn } from "@/lib/utils";

const BottomNav = () => {
  const navItems = [
    { icon: Home, label: "Inicio", path: "/" },
    { icon: Camera, label: "Escanear", path: "/scanner" },
    { icon: Dumbbell, label: "Ejercicios", path: "/exercises" },
    { icon: Target, label: "Misiones", path: "/missions" },
    { icon: Book, label: "Dietas", path: "/diets" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-20 max-w-2xl mx-auto px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
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
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
