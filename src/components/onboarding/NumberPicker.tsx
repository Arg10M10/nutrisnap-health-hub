import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

interface NumberPickerProps {
  value: number | null;
  onValueChange: (value: number) => void;
  label: string;
  unit: string;
  min: number;
  max: number;
  step?: number;
}

export const NumberPicker = ({ value, onValueChange, label, unit, min, max, step = 1 }: NumberPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(value ?? min);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const numbers = Array.from({ length: (max - min) / step + 1 }, (_, i) => min + i * step);

  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      const selectedElement = scrollContainerRef.current.querySelector(`[data-value="${internalValue}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'center' });
      }
    }
  }, [isOpen, internalValue]);

  const handleConfirm = () => {
    onValueChange(internalValue);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        className="w-full h-14 text-lg justify-start p-6"
        onClick={() => setIsOpen(true)}
      >
        <span className="flex-1 text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">
          {value !== null ? `${value} ${unit}` : 'Seleccionar'}
        </span>
      </Button>

      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-center">{label}</DrawerTitle>
          </DrawerHeader>
          <div
            ref={scrollContainerRef}
            className="h-48 overflow-y-scroll px-4"
            style={{ scrollSnapType: 'y mandatory' }}
          >
            <div className="py-16"> {/* Padding for centering */}
              {numbers.map((num) => (
                <div
                  key={num}
                  data-value={num}
                  onClick={() => setInternalValue(num)}
                  className={cn(
                    'flex items-center justify-center h-12 text-2xl font-semibold rounded-md transition-colors cursor-pointer',
                    'snap-center',
                    internalValue === num ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {num}
                </div>
              ))}
            </div>
          </div>
          <DrawerFooter>
            <Button size="lg" onClick={handleConfirm}>Confirmar</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};