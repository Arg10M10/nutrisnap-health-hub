import { format, subDays, isToday as checkIsToday } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";

interface StreakCalendarProps {
  streakDays: string[]; // Array of dates in 'yyyy-MM-dd' format
}

const StreakCalendar = ({ streakDays }: StreakCalendarProps) => {
  const today = new Date();
  const weekDays = Array.from({ length: 7 })
    .map((_, i) => subDays(today, i))
    .reverse();

  return (
    <div className="grid grid-cols-7 gap-2 mt-2">
      {weekDays.map((day) => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const isInStreak = streakDays.includes(dayKey);
        const isToday = checkIsToday(day);

        return (
          <div
            key={day.toString()}
            className="flex flex-col items-center justify-center gap-1 py-1"
          >
            <span className="text-xs capitalize font-medium text-muted-foreground">
              {format(day, "EEE", { locale: es })}
            </span>
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
                isInStreak ? "bg-orange-400" : "bg-muted",
                isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background"
              )}
            >
              {isInStreak ? (
                <Flame className="w-4 h-4 text-white fill-current" />
              ) : (
                <span className="font-bold text-sm text-muted-foreground">
                  {format(day, "d")}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StreakCalendar;