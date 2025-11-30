import { format, subDays, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WeeklyCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const WeeklyCalendar = ({ selectedDate, onDateSelect }: WeeklyCalendarProps) => {
  const today = new Date();
  const weekDays = Array.from({ length: 7 })
    .map((_, i) => subDays(today, i))
    .reverse();

  return (
    <div className="flex justify-between gap-2">
      {weekDays.map((day) => {
        const isSelected = isSameDay(day, selectedDate);
        return (
          <Button
            key={day.toString()}
            variant={isSelected ? "default" : "outline"}
            className={cn(
              "flex flex-col h-20 w-full rounded-2xl transition-all duration-200 p-2",
              isSelected ? "bg-primary text-primary-foreground shadow-lg" : "bg-card text-card-foreground"
            )}
            onClick={() => onDateSelect(day)}
          >
            <span className="text-sm font-medium capitalize">{format(day, "EEE", { locale: es })}</span>
            <span className="text-2xl font-bold">{format(day, "d")}</span>
          </Button>
        );
      })}
    </div>
  );
};

export default WeeklyCalendar;