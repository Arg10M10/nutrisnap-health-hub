import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Dumbbell } from 'lucide-react';
import { IntensitySelector, Intensity } from '@/components/exercise/IntensitySelector';
import { DurationSlider } from '@/components/exercise/DurationSlider';
import { motion, Transition } from 'framer-motion';

// MET aproximados para entrenamiento de fuerza
const MET_VALUES: Record<Intensity, number> = {
  Low: 3.5,     // Pesas ligeras
  Medium: 5.0,  // Pesas moderadas
  High: 6.0,    // Pesas intensas
};

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 },
};

const pageTransition: Transition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.2,
};

const Weights = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [intensity, setIntensity] = useState<Intensity | null>(null);
  const [duration, setDuration] = useState(30);

  const calculateCalories = () => {
    if (!intensity || !profile?.weight) return 0;
    const met = MET_VALUES[intensity];
    return Math.round(((met * profile.weight * 3.5) / 200) * duration);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user || !intensity) throw new Error('Missing data for logging.');
      const calories_burned = calculateCalories();
      const { error } = await supabase.from('exercise_entries').insert({
        user_id: user.id,
        exercise_type: 'weights',
        intensity: intensity.toLowerCase(),
        duration_minutes: duration,
        calories_burned,
      });
      if (error) throw error;
      return { calories_burned };
    },
    onSuccess: ({ calories_burned }) => {
      queryClient.invalidateQueries({ queryKey: ['exercise_entries', user?.id] });
      toast.success(t('weights.saved_toast_title'), {
        description: t('weights.saved_toast_desc', { calories: calories_burned }),
      });
      navigate('/');
    },
    onError: (error) => {
      toast.error(t('weights.error_toast_title'), {
        description: (error as Error).message,
      });
    },
  });

  const canSave = intensity !== null && duration > 0;

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="flex min-h-screen flex-col bg-background"
    >
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="flex items-center gap-2">
          <Dumbbell className="w-7 h-7 text-primary" />
          <h1 className="text-2xl font-bold text-primary">{t('weights.title')}</h1>
        </div>
      </header>
      <main className="flex-1 p-4 pb-28 space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4 text-foreground">{t('running.choose_intensity')}</h2>
          <IntensitySelector selectedIntensity={intensity} onSelectIntensity={setIntensity} />
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-4 text-foreground">{t('running.adjust_duration')}</h2>
          <DurationSlider value={duration} onValueChange={setDuration} />
        </section>
      </main>
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t">
        <Button
          size="lg"
          className="w-full h-14 text-lg"
          disabled={!canSave || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            t('weights.save_action', { calories: calculateCalories() })
          )}
        </Button>
      </footer>
    </motion.div>
  );
};

export default Weights;