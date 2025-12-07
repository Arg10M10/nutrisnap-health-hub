import { useRef, useEffect, UIEvent } from 'react';
import { cn } from '@/lib/utils';
import { useDebouncedCallback } from 'use-debounce';

interface WheelPickerProps<T extends string | number> {
  items: T[];
  value: T | null;
  onValueChange: (value: T) => void;
  className?: string;
}

const ITEM_HEIGHT = 48; // h-12 in tailwind

const WheelPicker = <T extends string | number>({ items, value, onValueChange, className }: WheelPickerProps<T>) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to the initial value when the component mounts or items change
  useEffect(() => {
    if (scrollRef.current && value !== null) {
      const index = items.indexOf(value);
      if (index !== -1) {
        scrollRef.current.scrollTop = index * ITEM_HEIGHT;
      }
    }
  }, [items]); // Run only once on mount or when items change

  const handleScroll = useDebouncedCallback((e: UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const selectedIndex = Math.round(scrollTop / ITEM_HEIGHT);
    const newValue = items[selectedIndex];
    if (newValue !== undefined && newValue !== value) {
      onValueChange(newValue);
    }
  }, 150);

  // When the value prop changes from outside, scroll to it
  useEffect(() => {
    if (scrollRef.current && value !== null) {
      const index = items.indexOf(value);
      if (index !== -1) {
        const targetScrollTop = index * ITEM_HEIGHT;
        if (Math.abs(scrollRef.current.scrollTop - targetScrollTop) > 1) {
          scrollRef.current.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth',
          });
        }
      }
    }
  }, [value, items]);

  return (
    <div className={cn("h-60 relative", className)}>
      {/* Highlight bar */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 bg-muted rounded-lg border" />
      
      {/* Scrollable container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ overscrollBehavior: 'contain' }}
      >
        {/* Padding to allow first and last items to be centered */}
        <div style={{ height: `calc(50% - ${ITEM_HEIGHT / 2}px)` }} />
        
        <div className="relative z-10">
          {items.map((item, index) => (
            <div
              key={index}
              className="h-12 flex items-center justify-center text-2xl font-semibold snap-center text-foreground"
            >
              {item}
            </div>
          ))}
        </div>

        {/* Padding to allow first and last items to be centered */}
        <div style={{ height: `calc(50% - ${ITEM_HEIGHT / 2}px)` }} />
      </div>

      {/* Fading mask */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)',
        }}
      />
    </div>
  );
};

export default WheelPicker;