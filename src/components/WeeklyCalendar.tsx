import { format, subDays, isSameDay, isToday as checkIsToday } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import MiniProgressCircle from "./MiniProgressCircle";

interface WeeklyCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  weeklyCalorieData: { [key: string]: number };
}

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

        return (
          <button
            key={day.toString()}
            onClick={() => onDateSelect(day)}
            className="flex flex-col items-center justify-center gap-2 py-2 rounded-xl transition-all duration-200"
          >
            <span className="text-xs capitalize font-medium text-muted-foreground">
              {format(day, "EEE", { locale: es })}
            </span>
            <div className={cn(
              "w-9 h-9 relative rounded-full border-2",
              isSelected ? "border-foreground" :
              isToday && !isSelected ? "border-destructive" : "border-transparent"
            )}>
              <MiniProgressCircle value={percentage} color={progressColor} size={32} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-bold text-sm text-foreground">
                  {format(day, "d")}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default WeeklyCalendar;