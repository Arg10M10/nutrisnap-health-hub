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
const SUB_TICK_HEIGHT = 16; // h-4
const TICK_HEIGHT = 24; // h-6
const MAJOR_TICK_HEIGHT = 32; // h-8

const RulerPicker = ({ min, max, step, value, onValueChange, unit, className }: RulerPickerProps) => {
  const rulerRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const scrollEndTimer = useRef<number | null>(null);
  const [localValue, setLocalValue] = useState(value);

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
    return Math.max(min, Math.min(max, parseFloat(snappedValue.toFixed(String(step).split('.')[1]?.length || 0))));
  };

  useEffect(() => {
    if (!isInteracting) {
      setLocalValue(value);
    }
  }, [value, isInteracting]);

  useEffect(() => {
    if (rulerRef.current && !isInteracting && containerWidth > 0) {
      const targetScroll = valueToScrollLeft(value);
      if (Math.abs(rulerRef.current.scrollLeft - targetScroll) > 1) {
        rulerRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
      }
    }
  }, [value, isInteracting, containerWidth]);

  const debouncedOnChange = useDebouncedCallback((val: number) => {
    onValueChange(val);
  }, 50);

  const handleScroll = () => {
    if (rulerRef.current) {
      if (isInteracting) {
        const newValue = scrollLeftToValue(rulerRef.current.scrollLeft);
        setLocalValue(newValue);
        debouncedOnChange(newValue);
      }

      if (scrollEndTimer.current) {
        clearTimeout(scrollEndTimer.current);
      }
      scrollEndTimer.current = window.setTimeout(() => {
        setIsInteracting(false);
      }, 150);
    }
  };

  const handleInteractionStart = () => {
    setIsInteracting(true);
    if (scrollEndTimer.current) {
      clearTimeout(scrollEndTimer.current);
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-4 w-full", className)}>
      <div className="text-6xl font-bold text-foreground flex items-baseline">
        <AnimatedNumber value={localValue} toFixed={step < 1 ? 1 : 0} />
        <span className="text-2xl font-medium text-muted-foreground ml-2">{unit}</span>
      </div>

      <div className="relative w-full h-24">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-1 bg-primary rounded-full z-10 pointer-events-none" />

        <div
          ref={rulerRef}
          className="w-full h-full overflow-x-scroll scrollbar-hide cursor-grab active:cursor-grabbing"
          onScroll={handleScroll}
          onTouchStart={handleInteractionStart}
          onMouseDown={handleInteractionStart}
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
                  className="flex-shrink-0 rounded-full"
                  style={{
                    width: isMajor ? '2px' : '1.5px',
                    height: `${height}px`,
                    marginRight: `${TICK_SPACING - (isMajor ? 2 : 1.5)}px`,
                    backgroundColor: isMajor ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                    opacity: isMajor ? 0.8 : (isSub ? 0.5 : 0.3),
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