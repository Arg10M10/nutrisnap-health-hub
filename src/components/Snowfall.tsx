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
}

interface SnowfallProps {
  enabled: boolean;
}

const SNOWFLAKE_COUNT = 40; // menos copos que antes

const Snowfall = ({ enabled }: SnowfallProps) => {
  const [flakes, setFlakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    if (!enabled) {
      setFlakes([]);
      return;
    }

    const newFlakes: Snowflake[] = Array.from({ length: SNOWFLAKE_COUNT }).map((_, i) => {
      const size = Math.random() * 4 + 2; // más pequeños: 2px - 6px
      return {
        id: i,
        left: Math.random() * 100,
        size,
        duration: 10 + Math.random() * 10,
        delay: Math.random() * -20,
        opacity: 0.2 + Math.random() * 0.3, // más transparente
        blur: Math.random() > 0.7 ? 1.5 : 0,
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
          className="absolute rounded-full bg-white"
          style={{
            left: `${flake.left}%`,
            width: flake.size,
            height: flake.size,
            opacity: flake.opacity,
            filter: flake.blur ? `blur(${flake.blur}px)` : undefined,
            top: "-10%",
            animationName: "calorel-snowfall",
            animationDuration: `${flake.duration}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationDelay: `${flake.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

export default Snowfall;