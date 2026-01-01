import { useMemo } from "react";
import { format, subDays, isSameDay, isToday as checkIsToday } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface DayProgressProps {
  percentage: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}

const DayProgressRing = ({ percentage, color, size = 36, strokeWidth = 2.5 }: DayProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = Math.max(0, circumference - (percentage / 100) * circumference);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background Dashed Circle */}
      <svg className="w-full h-full absolute inset-0 rotate-[-90deg]" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray="4 4"
          className="text-muted-foreground/30"
        />
      </svg>
      
      {/* Progress Circle (Solid) */}
      {percentage > 0 && (
        <svg className="w-full h-full absolute inset-0 rotate-[-90deg]" viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
      )}
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
  const currentLocale = i18n.language.startsWith('es') ? es : enUS;

  const weekDays = useMemo(() => {
    const today = new Date();
    // Generar últimos 6 días + hoy (total 7), invertido para que hoy esté a la derecha usualmente
    // La imagen muestra una secuencia natural de izquierda a derecha. Vamos a ordenarlo cronológicamente.
    // La imagen muestra miercoles 31 seleccionado.
    // Vamos a mostrar los últimos 3 días y los próximos 3? O la última semana?
    // El componente anterior mostraba los últimos 7 días terminando en hoy.
    // Vamos a mantener esa lógica pero ordenarlos de izquierda a derecha (el más antiguo a la izquierda).
    
    return Array.from({ length: 7 })
      .map((_, i) => subDays(today, 6 - i)); // 6 días atrás hasta hoy
  }, []);

  return (
    <div className="w-full flex justify-between items-end px-2 py-2">
      {weekDays.map((day) => {
        const isSelected = isSameDay(day, selectedDate);
        const dayKey = format(day, 'yyyy-MM-dd');
        
        const calories = weeklyCalorieData[dayKey] || 0;
        const percentage = calorieGoal > 0 ? (calories / calorieGoal) * 100 : 0;

        const difference = calories - calorieGoal;
        let progressColor = 'hsl(var(--primary))'; // Greenish
        
        if (difference > 200) progressColor = '#ef4444'; // Red
        else if (difference > 50) progressColor = '#f59e0b'; // Yellow/Orange

        return (
          <button
            key={day.toString()}
            onClick={() => onDateSelect(day)}
            className={cn(
              "group flex flex-col items-center gap-3 pb-3 pt-4 rounded-[2rem] transition-all duration-200 min-w-[3.5rem]",
              isSelected ? "bg-muted/15 backdrop-blur-sm shadow-sm" : "hover:bg-muted/5"
            )}
          >
            {/* Day Name */}
            <span className={cn(
              "text-sm font-medium capitalize",
              isSelected ? "text-foreground font-bold" : "text-muted-foreground/60"
            )}>
              {format(day, "EEE", { locale: currentLocale }).replace('.', '')}
            </span>

            {/* Date Circle */}
            <div className="relative flex items-center justify-center">
              <DayProgressRing 
                percentage={Math.min(percentage, 100)} 
                color={progressColor}
                size={42} 
                strokeWidth={2}
              />
              <span className={cn(
                "absolute text-lg font-semibold",
                isSelected ? "text-foreground" : "text-muted-foreground"
              )}>
                {format(day, "d")}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default WeeklyCalendar;