import { format, subDays, isSameDay, isToday as checkIsToday } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DayCircleProps {
  percentage: number;
  progressColor: string;
  trackColor: string;
  dayNumber: string;
  isDotted?: boolean;
}

const DayCircle = ({ percentage, progressColor, trackColor, dayNumber, isDotted = false }: DayCircleProps) => {
  const size = 36;
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = Math.max(0, circumference - (percentage / 100) * circumference);

  return (
    <div className="w-9 h-9 relative">
      <svg className="w-full h-full" viewBox={`0 0 ${size} ${size}`}>
        {isDotted ? (
          <circle
            stroke={trackColor}
            strokeWidth={strokeWidth}
            strokeDasharray="2 4"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        ) : (
          <>
            <circle
              stroke={trackColor}
              strokeWidth={strokeWidth}
              fill="transparent"
              r={radius}
              cx={size / 2}
              cy={size / 2}
            />
            {percentage > 0 && (
              <circle
                stroke={progressColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                fill="transparent"
                r={radius}
                cx={size / 2}
                cy={size / 2}
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: offset,
                  transform: 'rotate(-90deg)',
                  transformOrigin: '50% 50%',
                  transition: 'stroke-dashoffset 0.3s ease-in-out',
                }}
              />
            )}
          </>
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-bold text-sm text-foreground">
          {dayNumber}
        </span>
      </div>
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
  const today = new Date();
  const weekDays = Array.from({ length: 7 })
    .map((_, i) => subDays(today, i))
    .reverse();

  return (
    <div className="grid grid-cols-7 gap-2 p-2 bg-muted rounded-2xl">
      {weekDays.map((day) => {
        const isSelected = isSameDay(day, selectedDate);
        const isToday = checkIsToday(day);
        const dayKey = format(day, 'yyyy-MM-dd');
        
        const calories = weeklyCalorieData[dayKey] || 0;
        const hasData = calories > 0;
        const difference = calories - calorieGoal;

        let progressColor = 'hsl(var(--primary))'; // Green
        if (difference > 200) {
          progressColor = 'hsl(var(--destructive))'; // Red
        } else if (difference > 100) {
          progressColor = '#f59e0b'; // Yellow/Amber
        }

        const percentage = calorieGoal > 0 ? (calories / calorieGoal) * 100 : 0;

        let trackColor = 'hsl(var(--border))';
        if (isSelected) {
          trackColor = 'hsl(var(--foreground))';
        } else if (isToday) {
          trackColor = 'hsl(var(--foreground))';
        }

        return (
          <button
            key={day.toString()}
            onClick={() => onDateSelect(day)}
            className="flex flex-col items-center justify-center gap-2 py-2 rounded-xl transition-all duration-200"
          >
            <span className="text-xs capitalize font-medium text-muted-foreground">
              {format(day, "EEE", { locale: es })}
            </span>
            <DayCircle 
              percentage={hasData ? percentage : 0}
              progressColor={progressColor}
              trackColor={trackColor}
              dayNumber={format(day, "d")}
              isDotted={!hasData}
            />
          </button>
        );
      })}
    </div>
  );
};

export default WeeklyCalendar;