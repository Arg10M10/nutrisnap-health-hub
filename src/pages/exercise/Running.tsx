import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Footprints } from 'lucide-react';
import { IntensitySelector, Intensity } from '@/components/exercise/IntensitySelector';
import { DurationSlider } from '@/components/exercise/DurationSlider';
import { motion } from 'framer-motion';
import NumberSwitch from '@/components/NumberSwitch';

// MET (Metabolic Equivalent of Task) values for running
const MET_VALUES: Record<Intensity, number> = {
  'Baja': 7.0,   // Jogging
  'Media': 9.8,  // Running at a good pace
  'Alta': 12.5,  // Running fast / sprints
};

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 },
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.2,
};

const Running = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [intensity, setIntensity] = useState<Intensity | null>(null);
  const [duration, setDuration] = useState(30);

  const calculateCalories = () => {
    if (!intensity || !profile?.weight) return 0;
    const met = MET_VALUES[intensity];
    // Formula: (MET * bodyweight in kg * 3.5) / 200 * duration in minutes
    return Math.round(((met * profile.weight * 3.5) / 200) * duration);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user || !intensity) throw new Error('Faltan datos para el registro.');
      
      const calories_burned = calculateCalories();

      const { error } = await supabase.from('exercise_entries').insert({
        user_id: user.id,
        exercise_type: 'running',
        intensity: intensity.toLowerCase(),
        duration_minutes: duration,
        calories_burned,
      });

      if (error) throw error;
      return { calories_burned };
    },
    onSuccess: ({ calories_burned }) => {
      toast.success('¡Carrera registrada!', {
        description: `Has quemado aproximadamente ${calories_burned} calorías.`,
      });
      navigate('/');
    },
    onError: (error) => {
      toast.error('No se pudo registrar el ejercicio.', {
        description: error.message,
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
          <Footprints className="w-7 h-7 text-primary" />
          <h1 className="text-2xl font-bold text-primary">Registrar Carrera</h1>
        </div>
      </header>
      <main className="flex-1 p-4 pb-28 space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4 text-foreground">1. Elige la intensidad</h2>
          <IntensitySelector selectedIntensity={intensity} onSelectIntensity={setIntensity} />
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-4 text-foreground">2. Ajusta la duración</h2>
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
            <div className="flex items-center justify-center gap-1.5">
              <span>Guardar Carrera (</span>
              <NumberSwitch number={calculateCalories()} />
              <span> kcal)</span>
            </div>
          )}
        </Button>
      </footer>
    </motion.div>
  );
};

export default Running;