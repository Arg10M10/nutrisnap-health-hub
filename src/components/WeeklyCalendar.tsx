import { format, subDays, isSameDay, isToday as checkIsToday } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DayCircleProps {
  percentage: number;
  progressColor: string;
  trackColor: string;
  dayNumber: string;
}

const DayCircle = ({ percentage, progressColor, trackColor, dayNumber }: DayCircleProps) => {
  const size = 36;
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Ensure offset doesn't go below 0
  const offset = Math.max(0, circumference - (percentage / 100) * circumference);

  return (
    <div className="w-9 h-9 relative">
      <svg className="w-full h-full" viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress */}
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
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-bold text-sm text-foreground">
          {dayNumber}
        </span>
      </div>
    </div>
  );
};

const WeeklyCalendar = ({ selectedDate, onDateSelect, weeklyCalorieData }: WeeklyCalendarProps) => {
  const today = new Date();
  const weekDays = Array.from({ length: 7 })
    .map((_, i) => subDays(today, i))
    .reverse();

  const calorieGoal = 2000;

  return (
    <div className="grid grid-cols-7 gap-2 p-2 bg-muted rounded-2xl">
      {weekDays.map((day) => {
        const isSelected = isSameDay(day, selectedDate);
        const isToday = checkIsToday(day);
        const dayKey = format(day, 'yyyy-MM-dd');
        const calories = weeklyCalorieData[dayKey] || 0;
        const percentage = calorieGoal > 0 ? (calories / calorieGoal) * 100 : 0;

        let progressColor = 'hsl(var(--primary))'; // Green
        if (percentage > 100) {
          progressColor = 'hsl(var(--destructive))'; // Red
        } else if (percentage > 75) {
          progressColor = '#f97316'; // Orange/Yellow
        }

        let trackColor = 'hsl(var(--border))';
        if (isSelected) {
          trackColor = 'hsl(var(--foreground))';
        } else if (isToday) {
          trackColor = 'hsl(var(--destructive))';
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
              percentage={percentage}
              progressColor={progressColor}
              trackColor={trackColor}
              dayNumber={format(day, "d")}
            />
          </button>
        );
      })}
    </div>
  );
};

export default WeeklyCalendar;