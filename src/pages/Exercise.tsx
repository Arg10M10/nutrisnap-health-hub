import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
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
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-500/10",
      borderColor: "border-blue-100 dark:border-blue-500/20"
    },
    { 
      name: t('exercise.btn_strength', 'Pesas'), 
      icon: Dumbbell, 
      path: '/exercise/weights', 
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-500/10",
      borderColor: "border-orange-100 dark:border-orange-500/20"
    },
    { 
      name: t('exercise.btn_ai', 'Texto IA'), 
      icon: Wand2, 
      path: '/exercise/write', 
      onClick: handleAIExerciseClick, // Intercept click
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-500/10",
      borderColor: "border-purple-100 dark:border-purple-500/20"
    },
    { 
      name: t('exercise.btn_manual', 'Manual'), 
      icon: Pencil, 
      path: '/exercise/manual', 
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-500/10",
      borderColor: "border-green-100 dark:border-green-500/20"
    },
  ];

  return (
    <PageLayout>
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-primary text-3xl">{t('exercise.title')}</h1>
          <p className="text-muted-foreground text-lg">
            {t('exercise.subtitle')}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {exercises.map((exercise) => (
            exercise.onClick ? (
              <div key={exercise.name} onClick={exercise.onClick} className="block group cursor-pointer">
                <Card className={cn(
                  "p-4 flex flex-col items-center justify-center gap-3 aspect-square transition-all duration-300 border-2",
                  "hover:scale-[1.02] active:scale-[0.98]",
                  exercise.bgColor,
                  exercise.borderColor
                )}>
                  <div className={cn("p-4 rounded-full bg-white dark:bg-background shadow-sm", exercise.color)}>
                    <exercise.icon className="w-8 h-8" />
                  </div>
                  <span className="font-bold text-lg text-foreground text-center leading-tight">
                    {exercise.name}
                  </span>
                </Card>
              </div>
            ) : (
              <Link to={exercise.path} key={exercise.name} className="block group">
                <Card className={cn(
                  "p-4 flex flex-col items-center justify-center gap-3 aspect-square transition-all duration-300 border-2",
                  "hover:scale-[1.02] active:scale-[0.98]",
                  exercise.bgColor,
                  exercise.borderColor
                )}>
                  <div className={cn("p-4 rounded-full bg-white dark:bg-background shadow-sm", exercise.color)}>
                    <exercise.icon className="w-8 h-8" />
                  </div>
                  <span className="font-bold text-lg text-foreground text-center leading-tight">
                    {exercise.name}
                  </span>
                </Card>
              </Link>
            )
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default Exercise;