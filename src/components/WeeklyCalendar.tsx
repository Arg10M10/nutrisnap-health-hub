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

const DayProgressRing = ({ percentage, color, size = 32, strokeWidth = 2 }: DayProgressProps) => {
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
          strokeDasharray="3 3"
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
    // Últimos 7 días hasta hoy, orden cronológico (el más antiguo primero)
    return Array.from({ length: 7 })
      .map((_, i) => subDays(today, 6 - i));
  }, []);

  return (
    <div className="w-full flex justify-between items-end px-1 py-2 overflow-x-auto no-scrollbar gap-1">
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
              "group flex flex-col items-center gap-1.5 pb-2 pt-2.5 rounded-[1.5rem] transition-all duration-200 min-w-[2.8rem] flex-1",
              isSelected ? "bg-muted/15 backdrop-blur-sm shadow-sm scale-105" : "hover:bg-muted/5 opacity-80 hover:opacity-100"
            )}
          >
            {/* Day Name */}
            <span className={cn(
              "text-[10px] uppercase font-bold tracking-tight",
              isSelected ? "text-foreground" : "text-muted-foreground/70"
            )}>
              {format(day, "EEE", { locale: currentLocale }).replace('.', '').substring(0, 3)}
            </span>

            {/* Date Circle */}
            <div className="relative flex items-center justify-center">
              <DayProgressRing 
                percentage={Math.min(percentage, 100)} 
                color={progressColor}
                size={34} 
                strokeWidth={2.5}
              />
              <span className={cn(
                "absolute text-sm font-bold",
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