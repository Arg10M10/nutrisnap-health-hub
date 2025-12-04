import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import PageLayout from '@/components/PageLayout';
import { Footprints, Bike, Dumbbell, Weight } from 'lucide-react';

const Exercise = () => {
  const { t } = useTranslation();

  const exercises = [
    { name: t('exercise.running'), icon: Footprints, path: '/exercise/running', enabled: true },
    { name: t('exercise.cycling'), icon: Bike, path: '#', enabled: false },
    { name: t('exercise.weights'), icon: Dumbbell, path: '#', enabled: false },
    { name: t('exercise.other'), icon: Weight, path: '#', enabled: false },
  ];

  const handleDisabledClick = () => {
    toast.info(t('toasts.coming_soon_title'), { description: t('toasts.coming_soon_desc') });
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-primary">{t('exercise.title')}</h1>
          <p className="text-muted-foreground text-lg">
            {t('exercise.subtitle')}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {exercises.map((exercise) =>
            exercise.enabled ? (
              <Link to={exercise.path} key={exercise.name}>
                <Card className="p-6 flex flex-col items-center justify-center gap-4 aspect-square hover:border-primary transition-colors">
                  <exercise.icon className="w-12 h-12 text-primary" />
                  <span className="font-semibold text-lg text-foreground">{exercise.name}</span>
                </Card>
              </Link>
            ) : (
              <Card
                key={exercise.name}
                onClick={handleDisabledClick}
                className="p-6 flex flex-col items-center justify-center gap-4 aspect-square cursor-pointer bg-muted/50 opacity-60"
              >
                <exercise.icon className="w-12 h-12 text-muted-foreground" />
                <span className="font-semibold text-lg text-muted-foreground">{exercise.name}</span>
              </Card>
            )
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Exercise;