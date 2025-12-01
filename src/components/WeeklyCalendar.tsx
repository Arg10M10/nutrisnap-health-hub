import { format, subDays, isSameDay, isToday as checkIsToday } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

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

        let calorieColor = 'bg-transparent';
        if (calories > 0) {
          if (percentage <= 75) {
            calorieColor = 'bg-green-500';
          } else if (percentage <= 100) {
            calorieColor = 'bg-yellow-500';
          } else {
            calorieColor = 'bg-red-500';
          }
        }
        
        const hasCalories = calories > 0;

        return (
          <button
            key={day.toString()}
            onClick={() => onDateSelect(day)}
            className={cn(
              "flex flex-col items-center justify-center gap-2 py-2 rounded-xl transition-all duration-200"
            )}
          >
            <span className={cn(
              "text-xs capitalize font-medium text-muted-foreground"
            )}>
              {format(day, "EEE", { locale: es })}
            </span>
            <div className={cn(
              "w-9 h-9 flex items-center justify-center rounded-full border-2 transition-colors",
              calorieColor,
              isSelected ? "border-foreground" :
              isToday && !isSelected ? "border-destructive" : "border-transparent"
            )}>
              <span className={cn(
                "font-bold text-sm",
                hasCalories ? "text-white" : "text-foreground"
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