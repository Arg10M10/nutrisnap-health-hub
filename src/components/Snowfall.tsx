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

/**
 * Pocos copos para que no moleste visualmente pero se note que es nieve.
 */
const SNOWFLAKE_COUNT = 35;
const FLAKE_CHARS = ["❄", "✻", "✼"];

const Snowfall = ({ enabled }: SnowfallProps) => {
  const [flakes, setFlakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    if (!enabled) {
      setFlakes([]);
      return;
    }

    const newFlakes: Snowflake[] = Array.from({ length: SNOWFLAKE_COUNT }).map((_, i) => {
      const size = Math.random() * 10 + 10; // 10px - 20px aprox (tamaño de fuente)
      const char = FLAKE_CHARS[Math.floor(Math.random() * FLAKE_CHARS.length)];
      return {
        id: i,
        left: Math.random() * 100,
        size,
        duration: 10 + Math.random() * 10,
        delay: Math.random() * -20,
        opacity: 0.3 + Math.random() * 0.5,
        blur: Math.random() > 0.7 ? 1.5 : 0,
        char,
        drift: Math.random() * 20 - 10, // ligera deriva horizontal
        rotate: Math.random() * 40 - 20, // inclinación inicial
      };
    });

    setFlakes(newFlakes);
  }, [enabled]);

  if (!enabled || flakes.length === 0) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-[9999] overflow-hidden",
        "bg-transparent"
      )}
      aria-hidden="true"
    >
      {flakes.map((flake) => (
        <span
          key={flake.id}
          className="absolute text-white select-none"
          style={{
            left: `${flake.left}%`,
            top: "-10%",
            fontSize: `${flake.size}px`,
            opacity: flake.opacity,
            filter: flake.blur ? `blur(${flake.blur}px)` : undefined,
            textShadow: "0 0 4px rgba(0,0,0,0.35)",
            animationName: "calorel-snowfall",
            animationDuration: `${flake.duration}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationDelay: `${flake.delay}s`,
            transform: `translate3d(0, 0, 0) rotate(${flake.rotate}deg)`,
          }}
        >
          {flake.char}
        </span>
      ))}
    </div>
  );
};

export default Snowfall;