import { useRef, useEffect, useMemo, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { cn } from '@/lib/utils';
import AnimatedNumber from './AnimatedNumber';

interface RulerPickerProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onValueChange: (value: number) => void;
  unit: string;
  className?: string;
}

const TICK_SPACING = 12; // px
const SUB_TICK_HEIGHT = 20; // h-5
const TICK_HEIGHT = 30; // h-7.5
const MAJOR_TICK_HEIGHT = 40; // h-10

const RulerPicker = ({ min, max, step, value, onValueChange, unit, className }: RulerPickerProps) => {
  const rulerRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  const ticks = useMemo(() => {
    const numTicks = Math.floor((max - min) / step) + 1;
    return Array.from({ length: numTicks }, (_, i) => min + i * step);
  }, [min, max, step]);

  const totalWidth = (ticks.length - 1) * TICK_SPACING;

  useEffect(() => {
    if (rulerRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
        if (entries[0]) {
          setContainerWidth(entries[0].contentRect.width);
        }
      });
      resizeObserver.observe(rulerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  const valueToScrollLeft = (val: number) => {
    const percent = (val - min) / (max - min);
    return percent * totalWidth;
  };

  const scrollLeftToValue = (scrollLeft: number) => {
    const percent = scrollLeft / totalWidth;
    const rawValue = min + percent * (max - min);
    const snappedValue = Math.round(rawValue / step) * step;
    return Math.max(min, Math.min(max, snappedValue));
  };

  useEffect(() => {
    if (rulerRef.current && !isInteracting && containerWidth > 0) {
      const targetScroll = valueToScrollLeft(value);
      rulerRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }
  }, [value, containerWidth]);

  const debouncedOnChange = useDebouncedCallback((val: number) => {
    onValueChange(val);
  }, 20);

  const handleScroll = () => {
    if (rulerRef.current && isInteracting) {
      const newValue = scrollLeftToValue(rulerRef.current.scrollLeft);
      debouncedOnChange(newValue);
    }
  };

  const handleInteractionStart = () => setIsInteracting(true);
  const handleInteractionEnd = () => {
    setIsInteracting(false);
    if (rulerRef.current) {
        const finalValue = scrollLeftToValue(rulerRef.current.scrollLeft);
        const targetScroll = valueToScrollLeft(finalValue);
        rulerRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
        onValueChange(finalValue);
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-4 w-full", className)}>
      <div className="text-6xl font-bold text-foreground flex items-baseline">
        <AnimatedNumber value={value} toFixed={step < 1 ? 1 : 0} />
        <span className="text-2xl font-medium text-muted-foreground ml-2">{unit}</span>
      </div>

      <div className="relative w-full h-24">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-1 bg-primary rounded-full z-10 pointer-events-none" />

        <div
          ref={rulerRef}
          className="w-full h-full overflow-x-scroll scrollbar-hide cursor-grab active:cursor-grabbing"
          onScroll={handleScroll}
          onTouchStart={handleInteractionStart}
          onTouchEnd={handleInteractionEnd}
          onMouseDown={handleInteractionStart}
          onMouseUp={handleInteractionEnd}
          onMouseLeave={handleInteractionEnd}
        >
          <div
            className="relative h-full flex items-center"
            style={{
              width: `${totalWidth + containerWidth}px`,
              paddingLeft: `${containerWidth / 2}px`,
              paddingRight: `${containerWidth / 2}px`,
            }}
          >
            {ticks.map((_, i) => {
              const isMajor = i % 10 === 0;
              const isSub = i % 5 === 0;
              
              let height = SUB_TICK_HEIGHT;
              if (isMajor) height = MAJOR_TICK_HEIGHT;
              else if (isSub) height = TICK_HEIGHT;

              return (
                <div
                  key={i}
                  className="flex-shrink-0"
                  style={{
                    width: isMajor ? '2px' : '1px',
                    height: `${height}px`,
                    marginRight: `${TICK_SPACING - (isMajor ? 2 : 1)}px`,
                    backgroundColor: isMajor ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                    opacity: isMajor ? 1 : 0.5,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RulerPicker;