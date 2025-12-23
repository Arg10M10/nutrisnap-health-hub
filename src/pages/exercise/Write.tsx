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
import { Badge } from '@/components/ui/badge';

const WriteExercise = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const { checkLimit, logUsage } = useAILimit();
  const [description, setDescription] = useState('');

  const saveAndAnalyzeMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!user) throw new Error('User not found');
      
      const { data, error } = await supabase
        .from('exercise_entries')
        .insert({
          user_id: user.id,
          description: text,
          status: 'processing',
          exercise_type: 'Analizando...',
          intensity: 'custom',
          duration_minutes: 0,
          calories_burned: 0,
        })
        .select()
        .single();
      if (error) throw error;
      return { newEntry: data };
    },
    onSuccess: ({ newEntry }) => {
      logUsage('exercise_ai');
      queryClient.invalidateQueries({ queryKey: ['exercise_entries', user?.id] });
      navigate('/');

      supabase.functions.invoke('estimate-exercise-calories', {
        body: { entry_id: newEntry.id, description, weight: profile?.weight ?? null, language: i18n.language },
      }).then(({ error }) => {
        if (error) {
          console.error("Function invocation failed:", error);
          supabase.from('exercise_entries').update({ status: 'failed', reason: 'Could not start analysis.' }).eq('id', newEntry.id).then(() => {
            queryClient.invalidateQueries({ queryKey: ['exercise_entries', user?.id] });
          });
        }
      });
    },
    onError: (error) => {
      console.error("Write exercise error:", error);
      toast.error(t('write_exercise.error_toast_title'), { description: t('common.error_friendly') });
    },
  });

  const handleAddExercise = async () => {
    if (description.trim().length < 10) {
      toast.info("Por favor, describe tu ejercicio con más detalle.");
      return;
    }
    const { canProceed, limit } = await checkLimit('exercise_ai', 2, 'daily');
    if (canProceed) {
      saveAndAnalyzeMutation.mutate(description);
    } else {
      toast.error(t('common.ai_limit_reached'), {
        description: t('common.ai_limit_daily_desc', { limit }),
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="p-4 pt-8 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold text-primary">{t('write_exercise.title')}</h1>
      </header>
      <main className="flex-1 p-4 flex flex-col">
        <div className="flex-1 space-y-4">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('write_exercise.placeholder')}
            className="h-40 text-lg resize-none"
          />
          <p className="text-sm text-muted-foreground text-center px-4">
            {t('write_exercise.example')}
          </p>
          <div className="flex justify-center pt-2">
            <Badge variant="outline" className="py-2 px-4 border-primary/20 bg-primary/5 text-primary">
              <Wand2 className="w-4 h-4 mr-2" />
              <span className="font-semibold">{t('write_exercise.ai_button')}</span>
            </Badge>
          </div>
        </div>
        <footer className="py-4">
          <Button
            size="lg"
            className="w-full h-14 text-lg rounded-full"
            onClick={handleAddExercise}
            disabled={saveAndAnalyzeMutation.isPending}
          >
            {saveAndAnalyzeMutation.isPending ? (
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