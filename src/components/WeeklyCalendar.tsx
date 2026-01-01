import { useMemo } from "react";
import { format, subDays, isSameDay, isToday as checkIsToday } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface DayProgressProps {
  percentage: number;
  color: string;
  trackColor?: string;
  size?: number;
  strokeWidth?: number;
}

const DayProgressRing = ({ percentage, color, trackColor, size = 32, strokeWidth = 3 }: DayProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = Math.max(0, circumference - (percentage / 100) * circumference);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor || "currentColor"}
          strokeWidth={strokeWidth}
          strokeDasharray={!trackColor ? "4 4" : "none"}
          className={!trackColor ? "text-muted-foreground/20" : ""}
        />
        {percentage > 0 && (
          <motion.circle
            initial={false}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.5, ease: "easeOut" }}
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
  const currentLocale = i18n.language.startsWith('es') ? es : enUS;

  const weekDays = useMemo(() => {
    const today = new Date();
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

          const difference = calories - calorieGoal;
          let progressColor = '#22c55e';
          
          if (percentage === 0) progressColor = 'transparent';
          else if (difference > 200) progressColor = '#ef4444';
          else if (difference > 50) progressColor = '#f59e0b';

          const textColor = isSelected ? "text-primary-foreground" : "text-muted-foreground";
          const numberColor = isSelected ? "text-primary-foreground font-bold" : "text-foreground font-semibold";
          
          const ringColor = isSelected ? "currentColor" : progressColor;
          const trackColor = isSelected ? "rgba(255,255,255,0.2)" : undefined;

          return (
            <button
              key={day.toString()}
              onClick={() => onDateSelect(day)}
              className="relative flex flex-col items-center justify-between py-2 rounded-[20px] h-[96px] w-full outline-none focus-visible:ring-2 focus-visible:ring-primary overflow-hidden group active:scale-95 transition-transform"
            >
              {isSelected && (
                <motion.div
                  layoutId="activeDayBackground"
                  className="absolute inset-0 bg-primary shadow-lg shadow-primary/20 rounded-[20px] z-0"
                  transition={{ type: "tween", ease: "circOut", duration: 0.25 }}
                />
              )}

              <div className="h-1.5 w-1.5 mb-0.5 relative z-10">
                {isToday && (
                  <div className={cn("w-full h-full rounded-full", isSelected ? "bg-white" : "bg-primary")} />
                )}
              </div>

              <span className={cn("text-[10px] uppercase tracking-wider font-bold relative z-10 transition-colors duration-200", textColor)}>
                {format(day, "EEE", { locale: currentLocale }).replace('.', '')}
              </span>

              <div className="relative z-10 mt-0.5 flex items-center justify-center w-12 h-12">
                <div className="absolute inset-0 flex items-center justify-center">
                   <DayProgressRing 
                      percentage={Math.min(percentage, 100)} 
                      color={ringColor}
                      trackColor={trackColor}
                      size={40} 
                      strokeWidth={3}
                   />
                </div>
                
                <span className={cn("text-base relative z-20 transition-colors duration-200", numberColor)}>
                  {format(day, "d")}
                </span>
              </div>

              <div className="h-1 w-1 mt-auto mb-1 relative z-10">
                 {!hasData && !isSelected && (
                    <div className="w-full h-full rounded-full bg-muted-foreground/10" />
                 )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyCalendar;