import { format, subDays, isToday as checkIsToday } from "date-fns";
import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";

interface StreakCalendarProps {
  streakDays: string[];
}

const StreakCalendar = ({ streakDays }: StreakCalendarProps) => {
  const today = new Date();
  const weekDays = Array.from({ length: 7 })
    .map((_, i) => subDays(today, i))
    .reverse();

  return (
    <div className="grid grid-cols-7 gap-1 w-full">
      {weekDays.map((day) => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const isInStreak = streakDays.includes(dayKey);
        const isToday = checkIsToday(day);

        return (
          <div
            key={day.toString()}
            className={cn(
              "aspect-square rounded-full flex items-center justify-center transition-all duration-200",
              isInStreak ? "bg-primary" : "bg-muted",
              isToday && "ring-1 ring-primary ring-offset-1 ring-offset-background"
            )}
          >
            {isInStreak ? (
              <Flame className="w-2/3 h-2/3 text-primary-foreground fill-current" />
            ) : (
              <span className="font-bold text-[10px] text-muted-foreground">
                {format(day, "d")}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StreakCalendar;