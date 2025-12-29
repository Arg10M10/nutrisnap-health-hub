import { useMemo } from "react";
import { format, subDays, isSameDay, isToday as checkIsToday } from "date-fns";
import { es, enUS } from "date-fns/locale"; // Importamos ambos locales
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

interface DayProgressProps {
  percentage: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}

const DayProgressRing = ({ percentage, color, size = 32, strokeWidth = 3 }: DayProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = Math.max(0, circumference - (percentage / 100) * circumference);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Fondo del anillo (track) */}
      <svg className="w-full h-full -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Progreso */}
        {percentage > 0 && (
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeLinecap="round"
          />
        )}
      </svg>
    </div>
  );
};

interface WeeklyCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  weeklyCalorieData: { [key: string]: number };
  calorieGoal: number;
}

const WeeklyCalendar = ({ selectedDate, onDateSelect, weeklyCalorieData, calorieGoal }: WeeklyCalendarProps) => {
  const { i18n } = useTranslation();
  
  // Determinar el locale basado en el idioma actual
  const currentLocale = i18n.language.startsWith('es') ? es : enUS;

  const weekDays = useMemo(() => {
    const today = new Date();
    // Generar los últimos 7 días incluyendo hoy
    return Array.from({ length: 7 })
      .map((_, i) => subDays(today, i))
      .reverse();
  }, []);

  return (
    <div className="w-full bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-2 shadow-sm">
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {weekDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = checkIsToday(day);
          const dayKey = format(day, 'yyyy-MM-dd');
          
          const calories = weeklyCalorieData[dayKey] || 0;
          const hasData = calories > 0;
          const percentage = calorieGoal > 0 ? (calories / calorieGoal) * 100 : 0;

          // Lógica de colores semáforo
          const difference = calories - calorieGoal;
          let progressColor = '#22c55e'; // Green (default safe)
          
          if (percentage === 0) progressColor = 'transparent';
          else if (difference > 200) progressColor = '#ef4444'; // Red (exceeded)
          else if (difference > 50) progressColor = '#f59e0b'; // Amber (warning)

          // Color del texto del día (cambia si está seleccionado)
          const textColor = isSelected ? "text-primary-foreground" : "text-muted-foreground";
          const numberColor = isSelected ? "text-primary-foreground font-bold" : "text-foreground font-semibold";

          return (
            <motion.button
              key={day.toString()}
              onClick={() => onDateSelect(day)}
              whileTap={{ scale: 0.95 }}
              className="relative flex flex-col items-center justify-between py-3 rounded-[20px] h-[88px] w-full outline-none focus-visible:ring-2 focus-visible:ring-primary overflow-hidden group"
            >
              {/* Fondo Animado de Selección ("La Pastilla") */}
              {isSelected && (
                <motion.div
                  layoutId="activeDayBackground"
                  className="absolute inset-0 bg-primary shadow-lg shadow-primary/20 rounded-[20px] z-0"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              {/* Indicador de "Hoy" (Puntito arriba) */}
              <div className="h-1.5 w-1.5 mb-1 relative z-10">
                {isToday && (
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }}
                    className={cn(
                      "w-full h-full rounded-full",
                      isSelected ? "bg-white" : "bg-primary"
                    )} 
                  />
                )}
              </div>

              {/* Nombre del día */}
              <span className={cn("text-[10px] uppercase tracking-wider font-bold relative z-10 transition-colors duration-200", textColor)}>
                {format(day, "EEE", { locale: currentLocale }).replace('.', '')}
              </span>

              {/* Número y Anillo */}
              <div className="relative z-10 mt-1 flex items-center justify-center">
                {/* El anillo va detrás del número pero visualmente lo envuelve */}
                <div className="absolute inset-0 flex items-center justify-center">
                   <DayProgressRing 
                      percentage={Math.min(percentage, 100)} 
                      color={isSelected ? "currentColor" : progressColor} // Si está seleccionado, usa el color del texto (blanco/negro), sino el color de progreso
                      size={36}
                      strokeWidth={isSelected ? 3 : 2.5}
                   />
                </div>
                
                <span className={cn("text-base relative z-20 transition-colors duration-200", numberColor)}>
                  {format(day, "d")}
                </span>
              </div>

              {/* Pequeño punto si hay datos pero no hay progreso visual claro (opcional) */}
              <div className="h-1 w-1 mt-1 relative z-10">
                 {!hasData && !isSelected && (
                    <div className="w-full h-full rounded-full bg-muted-foreground/20" />
                 )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyCalendar;