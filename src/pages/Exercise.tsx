import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import PageLayout from '@/components/PageLayout';
import { Footprints, Dumbbell, Wand2, Pencil } from 'lucide-react';
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
    },
    { 
      name: t('exercise.btn_strength', 'Weights'), 
      icon: Dumbbell, 
      path: '/exercise/weights',
    },
    { 
      name: t('exercise.btn_ai', 'AI Text'), 
      icon: Wand2, 
      path: '/exercise/write', 
      onClick: handleAIExerciseClick,
    },
    { 
      name: t('exercise.btn_manual', 'Manual'), 
      icon: Pencil, 
      path: '/exercise/manual', 
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
            const content = (
              <Card className="p-6 flex flex-col items-center justify-center gap-4 aspect-square transition-all duration-300 border shadow-sm group bg-card hover:bg-muted/40 hover:border-foreground/20 hover:scale-[1.02] active:scale-[0.98]">
                <div className="p-4 rounded-2xl bg-muted text-foreground transition-colors group-hover:bg-background group-hover:shadow-sm">
                  <exercise.icon className="w-8 h-8" strokeWidth={1.5} />
                </div>
                
                <span className="font-semibold text-lg text-center leading-tight tracking-tight text-muted-foreground group-hover:text-foreground transition-colors">
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