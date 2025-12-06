import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Wand2 } from 'lucide-react';
import { useAILimit } from '@/hooks/useAILimit';

const WriteExercise = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const { checkLimit, logUsage } = useAILimit();

  const [description, setDescription] = useState('');
  const [estimatedData, setEstimatedData] = useState<{ name: string; duration: number; calories: number } | null>(null);

  const estimateMutation = useMutation({
    mutationFn: async (text: string) => {
      const { data, error } = await supabase.functions.invoke('estimate-exercise-calories', {
        body: { description: text, weight: profile?.weight ?? null },
      });
      if (error) throw new Error(error.message);
      return data as { name: string; duration: number; calories: number };
    },
    onSuccess: (data) => {
      logUsage('exercise_ai');
      setEstimatedData(data);
      toast.success(t('write_exercise.ai_success_toast'));
    },
    onError: (error) => {
      toast.error(t('write_exercise.error_toast_title'), { description: (error as Error).message });
    },
  });

  const handleEstimate = async () => {
    if (description.trim().length < 10) {
      toast.info("Por favor, describe tu ejercicio con más detalle.");
      return;
    }
    const canProceed = await checkLimit('exercise_ai', 2, 'daily');
    if (canProceed) {
      estimateMutation.mutate(description);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user || !estimatedData) throw new Error(t('write_exercise.validation_error'));
      const { error } = await supabase.from('exercise_entries').insert({
        user_id: user.id,
        exercise_type: estimatedData.name.toLowerCase(),
        intensity: 'custom',
        duration_minutes: estimatedData.duration,
        calories_burned: estimatedData.calories,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise_entries', user?.id] });
      toast.success(t('write_exercise.saved_toast'));
      navigate('/');
    },
    onError: (error) => {
      toast.error(t('write_exercise.error_toast_title'), { description: (error as Error).message });
    },
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold text-primary">{t('write_exercise.title')}</h1>
      </header>
      <main className="flex-1 p-4 flex flex-col">
        <div className="flex-1 space-y-6">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('write_exercise.placeholder')}
            className="h-32 text-lg resize-none"
          />
          <Button
            variant="outline"
            className="w-full h-14 text-lg rounded-full"
            onClick={handleEstimate}
            disabled={estimateMutation.isPending}
          >
            {estimateMutation.isPending ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-5 w-5" />
            )}
            {estimateMutation.isPending ? t('write_exercise.ai_button_loading') : t('write_exercise.ai_button')}
          </Button>
          <div className="bg-muted p-4 rounded-xl">
            <p className="text-muted-foreground text-center">{t('write_exercise.example')}</p>
          </div>
          {estimatedData && (
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl text-center">
              <p className="font-semibold text-primary">Estimación de la IA:</p>
              <p className="text-foreground">
                {estimatedData.name} - {estimatedData.duration} min - {estimatedData.calories} kcal
              </p>
            </div>
          )}
        </div>
        <footer className="py-4">
          <Button
            size="lg"
            className="w-full h-14 text-lg rounded-full"
            onClick={() => saveMutation.mutate()}
            disabled={!estimatedData || saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : null}
            {t('write_exercise.add_button')}
          </Button>
        </footer>
      </main>
    </div>
  );
};

export default WriteExercise;