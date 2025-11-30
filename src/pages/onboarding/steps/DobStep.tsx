import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DobStepProps {
  dob: Date | null;
  setDob: (date: Date | undefined) => void;
}

export const DobStep = ({ dob, setDob }: DobStepProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal h-14 text-lg',
            !dob && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dob ? format(dob, 'PPP', { locale: es }) : <span>Selecciona una fecha</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={dob || undefined}
          onSelect={setDob}
          initialFocus
          locale={es}
          captionLayout="dropdown-buttons"
          fromYear={1920}
          toYear={new Date().getFullYear()}
        />
      </PopoverContent>
    </Popover>
  );
};