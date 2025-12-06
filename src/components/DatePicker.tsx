import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addYears } from 'date-fns';
import { es } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

const DatePicker = ({ value, onChange, label, placeholder = 'Selecciona una fecha', className }: DatePickerProps) => {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(value ?? new Date());

  const displayValue = value ? format(value, 'PPP', { locale: es }) : placeholder;

  const handleSelect = (date: Date | undefined) => {
    if (!date) {
      onChange(null);
      return;
    }
    onChange(date);
    setMonth(date);
    setOpen(false);
  };

  const jumpYears = (delta: number) => {
    setMonth((prev) => addYears(prev, delta));
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <p className="text-sm font-medium text-foreground">
          {label}
        </p>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-between h-12 text-left font-normal',
              !value && 'text-muted-foreground'
            )}
          >
            <span className="truncate">{displayValue}</span>
            <CalendarIcon className="ml-2 h-4 w-4 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <div className="border-b px-3 py-2 flex items-center justify-between bg-muted/40">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => jumpYears(-10)}
              >
                <ChevronLeft className="h-4 w-4" />
                <ChevronLeft className="h-4 w-4 -ml-2" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => jumpYears(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-sm font-medium">
              {format(month, 'yyyy')}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => jumpYears(1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => jumpYears(10)}
              >
                <ChevronRight className="h-4 w-4" />
                <ChevronRight className="h-4 w-4 -ml-2" />
              </Button>
            </div>
          </div>
          <Calendar
            mode="single"
            selected={value ?? undefined}
            month={month}
            onMonthChange={setMonth}
            onSelect={handleSelect}
            initialFocus
            locale={es}
            disabled={(date) => date > new Date()}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DatePicker;