import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import PageLayout from '@/components/PageLayout';
import { Footprints, Dumbbell, Wand2, Pencil, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAILimit } from '@/hooks/useAILimit';

const Exercise = () => {
  const { t } = useTranslation();
  const { checkLimit } = useAILimit();
  const navigate = useNavigate();

  const handleAIExerciseClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const canProceed = await checkLimit('exercise_ai', 9999, 'daily');
    if (canProceed) {
      navigate('/exercise/write');
    }
  };

  const exercises = [
    { 
      name: t('exercise.btn_cardio', 'Cardio'), 
      icon: Footprints, 
      path: '/exercise/running',
      type: 'standard'
    },
    { 
      name: t('exercise.btn_strength', 'Weights'), 
      icon: Dumbbell, 
      path: '/exercise/weights',
      type: 'standard'
    },
    { 
      name: t('exercise.btn_ai', 'AI Text'), 
      icon: Wand2, 
      path: '/exercise/write', 
      onClick: handleAIExerciseClick,
      type: 'ai'
    },
    { 
      name: t('exercise.btn_manual', 'Manual'), 
      icon: Pencil, 
      path: '/exercise/manual', 
      type: 'standard'
    },
  ];

  return (
    <PageLayout>
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-primary text-3xl font-bold tracking-tight">{t('exercise.title')}</h1>
          <p className="text-muted-foreground text-lg font-medium">
            {t('exercise.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {exercises.map((exercise) => {
            const isAI = exercise.type === 'ai';
            
            const content = (
              <Card className={cn(
                "p-6 flex flex-col items-center justify-center gap-4 aspect-square transition-all duration-300 border shadow-sm group relative overflow-hidden",
                isAI 
                  ? "bg-foreground/5 border-foreground/10 hover:bg-foreground/10 hover:border-foreground/20 hover:scale-[1.02]" 
                  : "bg-card border-border/50 hover:border-foreground/20 hover:bg-muted/30 hover:scale-[1.02] active:scale-[0.98]"
              )}>
                {isAI && (
                  <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                    <Sparkles className="w-12 h-12" />
                  </div>
                )}

                <div className={cn(
                  "p-4 rounded-2xl transition-colors",
                  isAI 
                    ? "bg-background shadow-sm text-foreground ring-1 ring-black/5 dark:ring-white/10" 
                    : "bg-muted text-foreground group-hover:bg-background group-hover:shadow-sm"
                )}>
                  <exercise.icon className={cn("w-8 h-8", isAI && "animate-pulse")} strokeWidth={1.5} />
                </div>
                
                <span className={cn(
                  "font-semibold text-lg text-center leading-tight tracking-tight",
                  isAI ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {exercise.name}
                </span>
              </Card>
            );

            return exercise.onClick ? (
              <div key={exercise.name} onClick={exercise.onClick} className="block cursor-pointer">
                {content}
              </div>
            ) : (
              <Link to={exercise.path} key={exercise.name} className="block">
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
};

export default Exercise;