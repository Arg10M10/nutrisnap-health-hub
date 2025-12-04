import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Loader2, FileText } from 'lucide-react';

const WriteExercise = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile } = useAuth();

  const [name, setName] = useState('');
  const [duration, setDuration] = useState<number>(30);
  const [estimated, setEstimated] = useState<number | null>(null);

  const estimateMutation = useMutation({
    mutationFn: async () => {
      if (!name || duration <= 0) throw new Error(t('write_exercise.validation_error'));
      const { data, error } = await supabase.functions.invoke('estimate-exercise-calories', {
        body: { name, duration, weight: profile?.weight ?? null },
      });
      if (error) throw new Error(error.message);
      return data as { calories: number };
    },
    onSuccess: ({ calories }) => {
      setEstimated(calories);
      toast.success(t('write_exercise.estimated_toast'), { description: `${calories} kcal` });
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
        <div className="flex items-center gap-2">
          <FileText className="w-7 h-7 text-primary" />
          <h1 className="text-2xl font-bold text-primary">{t('write_exercise.title')}</h1>
        </div>
      </header>
      <main className="flex-1 p-4 space-y-6">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">{t('write_exercise.name_label')}</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('write_exercise.name_placeholder')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">{t('write_exercise.duration_label')}</label>
              <Input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value || '0', 10))} />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 h-12" onClick={() => estimateMutation.mutate()} disabled={estimateMutation.isPending}>
                {estimateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {t('write_exercise.estimate_button')}
              </Button>
            </div>
            {estimated !== null && (
              <p className="text-center text-sm text-muted-foreground">
                {t('write_exercise.estimated_label')}: <span className="font-semibold text-foreground">{estimated} kcal</span>
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default WriteExercise;