import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Flame, Zap, Wind } from 'lucide-react';

export type Intensity = 'Baja' | 'Media' | 'Alta';

interface IntensitySelectorProps {
  selectedIntensity: Intensity | null;
  onSelectIntensity: (intensity: Intensity) => void;
}

const intensityOptions = [
  {
    name: 'Baja' as Intensity,
    description: 'Ritmo suave y constante.',
    example: 'Caminata rápida, trote ligero.',
    icon: Wind,
    color: 'text-blue-500',
    borderColor: 'border-blue-500',
  },
  {
    name: 'Media' as Intensity,
    description: 'Aumenta tu ritmo cardíaco.',
    example: 'Correr a un ritmo cómodo.',
    icon: Zap,
    color: 'text-orange-500',
    borderColor: 'border-orange-500',
  },
  {
    name: 'Alta' as Intensity,
    description: 'Esfuerzo máximo, intervalos.',
    example: 'Sprints, correr en cuestas.',
    icon: Flame,
    color: 'text-red-500',
    borderColor: 'border-red-500',
  },
];

export const IntensitySelector = ({ selectedIntensity, onSelectIntensity }: IntensitySelectorProps) => {
  return (
    <div className="space-y-4">
      {intensityOptions.map((option) => {
        const isSelected = selectedIntensity === option.name;
        return (
          <Card
            key={option.name}
            onClick={() => onSelectIntensity(option.name)}
            className={cn(
              'p-4 cursor-pointer transition-all duration-300 relative overflow-hidden',
              isSelected ? `${option.borderColor} ring-2 ring-offset-2 ring-offset-background ${option.borderColor}` : 'hover:border-muted-foreground'
            )}
          >
            <div className="flex items-center gap-4">
              <option.icon className={cn('w-8 h-8 flex-shrink-0', option.color)} />
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground">{option.name}</h3>
                <p className="text-sm text-muted-foreground">{option.description}</p>
                <p className="text-xs text-muted-foreground/80 italic">{option.example}</p>
              </div>
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <CheckCircle2 className={cn('w-6 h-6', option.color)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        );
      })}
    </div>
  );
};