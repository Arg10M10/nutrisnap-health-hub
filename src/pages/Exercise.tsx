import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/PageLayout';
import { Footprints, Bike, Dumbbell, Weight } from 'lucide-react';

const exercises = [
  { name: 'Running', icon: Footprints, path: '/exercise/running', enabled: true },
  { name: 'Cycling', icon: Bike, path: '#', enabled: false },
  { name: 'Weights', icon: Dumbbell, path: '#', enabled: false },
  { name: 'Other', icon: Weight, path: '#', enabled: false },
];

const Exercise = () => {
  const handleDisabledClick = () => {
    toast.info('Coming Soon', { description: 'This feature will be available soon.' });
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-primary">Log Exercise</h1>
          <p className="text-muted-foreground text-lg">
            Select the activity you performed to add it to your diary.
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