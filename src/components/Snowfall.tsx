import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Snowflake {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  blur: number;
  char: string;
  drift: number;
  rotate: number;
}

interface SnowfallProps {
  enabled: boolean;
}

const SNOWFLAKE_COUNT = 50; 
const FLAKE_CHARS = ["❄", "❅", "❆", "•"];

const Snowfall = ({ enabled }: SnowfallProps) => {
  const [flakes, setFlakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    if (!enabled) {
      setFlakes([]);
      return;
    }

    const newFlakes: Snowflake[] = Array.from({ length: SNOWFLAKE_COUNT }).map((_, i) => {
      const size = Math.random() * 15 + 8; // Tamaño variado
      const char = FLAKE_CHARS[Math.floor(Math.random() * FLAKE_CHARS.length)];
      return {
        id: i,
        left: Math.random() * 100,
        size,
        duration: 10 + Math.random() * 20, // Caída lenta
        delay: Math.random() * -30, // Inicio aleatorio para que ya haya nieve al cargar
        opacity: 0.2 + Math.random() * 0.5,
        blur: Math.random() > 0.5 ? 1 : 0,
        char,
        drift: Math.random() * 50 - 25,
        rotate: Math.random() * 360,
      };
    });

    setFlakes(newFlakes);
  }, [enabled]);

  if (!enabled || flakes.length === 0) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-0 overflow-hidden", 
        "bg-transparent"
      )}
      aria-hidden="true"
    >
      {flakes.map((flake) => (
        <span
          key={flake.id}
          className="absolute text-white select-none will-change-transform"
          style={{
            left: `${flake.left}%`,
            top: "-20px",
            fontSize: `${flake.size}px`,
            opacity: flake.opacity,
            filter: flake.blur ? `blur(${flake.blur}px)` : undefined,
            textShadow: "0 0 5px rgba(255,255,255,0.4)",
            animationName: "calorel-snowfall",
            animationDuration: `${flake.duration}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationDelay: `${flake.delay}s`,
            // Combinamos la rotación inicial con la deriva en la animación CSS si fuera posible, 
            // pero aquí usamos transform estático para rotación inicial.
            transform: `rotate(${flake.rotate}deg)`,
          }}
        >
          {flake.char}
        </span>
      ))}
    </div>
  );
};

export default Snowfall;