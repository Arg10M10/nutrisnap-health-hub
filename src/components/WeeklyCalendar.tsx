import { format, subDays, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";

interface WeeklyCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  streakDays: string[];
}

const WeeklyCalendar = ({ selectedDate, onDateSelect, streakDays }: WeeklyCalendarProps) => {
  const today = new Date();
  const weekDays = Array.from({ length: 7 })
    .map((_, i) => subDays(today, i))
    .reverse();

  return (
    <div className="flex justify-between gap-2">
      {weekDays.map((day) => {
        const isSelected = isSameDay(day, selectedDate);
        const dayKey = format(day, 'yyyy-MM-dd');
        const isInStreak = streakDays.includes(dayKey);

        return (
          <Button
            key={day.toString()}
            variant={isSelected ? "default" : "outline"}
            className={cn(
              "relative flex flex-col h-16 w-full rounded-xl transition-all duration-200 p-1",
              isSelected ? "bg-primary text-primary-foreground shadow-lg" : "bg-card text-card-foreground",
              isInStreak && !isSelected && "bg-yellow-400/10 border-yellow-500/30"
            )}
            onClick={() => onDateSelect(day)}
          >
            {isInStreak && (
              <Flame className="absolute top-1 right-1 w-3.5 h-3.5 text-yellow-500" />
            )}
            <span className={cn("text-xs font-medium capitalize", isInStreak && !isSelected && "text-yellow-600")}>
              {format(day, "EEE", { locale: es })}
            </span>
            <span className={cn("text-xl font-bold", isInStreak && !isSelected && "text-yellow-600")}>
              {format(day, "d")}
            </span>
          </Button>
        );
      })}
    </div>
  );
};

export default WeeklyCalendar;