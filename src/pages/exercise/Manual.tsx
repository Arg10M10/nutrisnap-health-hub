import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Pencil } from 'lucide-react';

const ManualExercise = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [duration, setDuration] = useState<number>(30);
  const [calories, setCalories] = useState<number>(200);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not found');
      if (!name || duration <= 0 || calories <= 0) throw new Error(t('manual_exercise.validation_error'));
      const { error } = await supabase.from('exercise_entries').insert({
        user_id: user.id,
        exercise_type: name.toLowerCase(),
        intensity: 'manual',
        duration_minutes: duration,
        calories_burned: calories,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise_entries', user?.id] });
      toast.success(t('manual_exercise.saved_toast'));
      navigate('/');
    },
    onError: (error) => {
      toast.error(t('manual_exercise.error_toast_title'), { description: (error as Error).message });
    },
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="flex items-center gap-2">
          <Pencil className="w-7 h-7 text-primary" />
          <h1 className="text-2xl font-bold text-primary">{t('manual_exercise.title')}</h1>
        </div>
      </header>
      <main className="flex-1 p-4 space-y-6">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">{t('manual_exercise.name_label')}</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('manual_exercise.name_placeholder')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">{t('manual_exercise.duration_label')}</label>
              <Input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value || '0', 10))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">{t('manual_exercise.calories_label')}</label>
              <Input type="number" value={calories} onChange={(e) => setCalories(parseInt(e.target.value || '0', 10))} />
            </div>
            <Button className="w-full h-12" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              {t('manual_exercise.save_button')}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ManualExercise;