import { format, subDays, isSameDay, isToday as checkIsToday } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface WeeklyCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  streakDays?: string[];
}

const WeeklyCalendar = ({ selectedDate, onDateSelect, streakDays = [] }: WeeklyCalendarProps) => {
  const today = new Date();
  const weekDays = Array.from({ length: 7 })
    .map((_, i) => subDays(today, i))
    .reverse();

  return (
    <div className="grid grid-cols-7 gap-1 p-1 bg-muted rounded-2xl">
      {weekDays.map((day) => {
        const isSelected = isSameDay(day, selectedDate);
        const isToday = checkIsToday(day);
        const dayKey = format(day, 'yyyy-MM-dd');
        const isInStreak = streakDays.includes(dayKey);

        return (
          <button
            key={day.toString()}
            onClick={() => onDateSelect(day)}
            className={cn(
              "flex flex-col items-center justify-center gap-2 py-2 rounded-xl transition-all duration-200",
              (isSelected || isInStreak) && "bg-card shadow"
            )}
          >
            <span className={cn(
              "text-xs capitalize font-medium",
              isSelected || isInStreak ? "text-foreground" : "text-muted-foreground"
            )}>
              {format(day, "EEE", { locale: es })}
            </span>
            <div className={cn(
              "w-8 h-8 flex items-center justify-center rounded-full border-2",
              isSelected ? "border-foreground" :
              isInStreak ? "border-green-500" :
              isToday ? "border-destructive" : "border-transparent"
            )}>
              <span className="font-bold text-sm text-foreground">
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