import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Flame, Loader2 } from 'lucide-react';

const ManualExercise = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [calories, setCalories] = useState<number | ''>('');

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not found');
      if (calories === '' || calories <= 0) throw new Error(t('manual_exercise.validation_error'));
      
      const { error } = await supabase.from('exercise_entries').insert({
        user_id: user.id,
        exercise_type: 'manual',
        intensity: 'manual',
        duration_minutes: 0,
        calories_burned: calories,
        status: 'completed',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise_entries', user?.id] });
      navigate('/');
    },
    onError: (error) => {
      toast.error(t('manual_exercise.error_toast_title'), { description: (error as Error).message });
    },
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="p-4 pt-8 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-primary">{t('manual_exercise.title')}</h1>
        </div>
      </header>
      <main className="flex-1 p-4 flex flex-col">
        <div className="flex-1 space-y-8">
          <h2 className="text-3xl font-bold text-foreground">{t('manual_exercise.calories_burned')}</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center flex-shrink-0">
              <Flame className="w-8 h-8 text-primary" />
            </div>
            <Input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
              placeholder="0"
              className="h-16 text-3xl font-bold"
              autoFocus
            />
          </div>
        </div>
        <footer className="py-4">
          <Button
            size="lg"
            className="w-full h-12 text-lg rounded-full"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || calories === '' || calories <= 0}
          >
            {mutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {t('manual_exercise.add_button')}
          </Button>
        </footer>
      </main>
    </div>
  );
};

export default ManualExercise;