import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Progress } from "@/components/ui/progress";
import { Brain, Calculator, CheckCircle2, Utensils } from "lucide-react";
import { useTranslation } from "react-i18next";

const GeneratingPlan = () => {
  const { user, profile, refetchProfile } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);

  const stages = [
    { text: "Analizando tu metabolismo basal...", icon: <Brain className="w-8 h-8 text-primary" /> },
    { text: "Calculando macronutrientes óptimos...", icon: <Calculator className="w-8 h-8 text-blue-500" /> },
    { text: "Diseñando estructura de comidas...", icon: <Utensils className="w-8 h-8 text-orange-500" /> },
    { text: "¡Plan personalizado listo!", icon: <CheckCircle2 className="w-8 h-8 text-green-500" /> },
  ];

  // Simulación de progreso visual - 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 99) {
          return 99; // Esperar a éxito
        }
        
        // Curva de progreso para 30s aprox
        let increment = 0;
        if (prev < 30) increment = 0.5; // Primeros 6s
        else if (prev < 70) increment = 0.2; // Siguientes 20s
        else increment = 0.1; // Final lento
        
        return Math.min(prev + increment, 99);
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress < 30) setStage(0);
    else if (progress < 60) setStage(1);
    else if (progress < 90) setStage(2);
    else setStage(3);
  }, [progress]);

  const generatePlanMutation = useMutation({
    mutationFn: async () => {
      if (!profile || !user) throw new Error("Profile not loaded");

      const isImperial = profile.units === 'imperial';
      
      // Normalizar a métrico para el backend si es necesario
      const weightInKg = profile.weight || 70;
      const finalWeight = isImperial ? weightInKg * 0.453592 : weightInKg;
      
      const heightVal = profile.height || 170;
      const finalHeight = isImperial ? heightVal * 2.54 : heightVal; // in -> cm
      
      // Asumimos actividad moderada (3 días) si no hay dato, es un buen promedio para iniciar
      // Si el usuario dijo que su experiencia es "First time", bajamos a 1-2 días
      let estimatedWorkouts = 3;
      if (profile.previous_apps_experience?.includes("first time")) {
        estimatedWorkouts = 2;
      }

      const weeklyRate = profile.weekly_rate || (isImperial ? 1.1 : 0.5); // lbs o kg
      const finalWeeklyRate = isImperial ? weeklyRate * 0.453592 : weeklyRate;

      // Llamada a la función con matemática estricta
      const { data: suggestions, error: suggestionError } = await supabase.functions.invoke('calculate-macros', {
        body: {
          weight: finalWeight,
          height: finalHeight,
          gender: profile.gender || 'male',
          age: profile.age || 30,
          goal: profile.goal || 'maintain_weight',
          weeklyRate: finalWeeklyRate,
          workoutsPerWeek: estimatedWorkouts
        },
      });

      if (suggestionError) throw new Error(suggestionError.message);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          goal_calories: suggestions.calories,
          goal_protein: suggestions.protein,
          goal_carbs: suggestions.carbs,
          goal_fats: suggestions.fats,
          goal_sugars: suggestions.sugars,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      return suggestions;
    },
    onSuccess: async () => {
      setProgress(100);
      setStage(3);
      await refetchProfile();
      setTimeout(() => {
        navigate('/');
      }, 1500);
    },
    onError: (error) => {
      console.error("Error generating plan", error);
      // En caso de error, no bloqueamos al usuario, usamos valores por defecto seguros
      navigate('/');
    }
  });

  useEffect(() => {
    if (user && profile) {
      // Pequeño delay inicial para que la UI se monte suavemente antes de la petición
      const timeout = setTimeout(() => {
        generatePlanMutation.mutate();
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [user, profile]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-12">
        
        <div className="flex justify-center h-32 items-center mb-8">
          <motion.div
            key={stage}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="bg-primary/10 p-8 rounded-full shadow-lg shadow-primary/10"
          >
            {stages[stage].icon}
          </motion.div>
        </div>

        <div className="space-y-8 text-center">
          <motion.h2 
            key={stage + "text"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-foreground min-h-[5rem] flex items-end justify-center px-4 leading-tight"
          >
            {stages[stage].text}
          </motion.h2>
          
          <div className="space-y-3 px-4">
            <Progress value={progress} className="h-4 rounded-full" />
            <p className="text-sm text-muted-foreground text-right font-mono font-medium">{Math.round(progress)}%</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 opacity-40 pointer-events-none mt-8">
          <div className="h-20 bg-muted/30 rounded-2xl border border-dashed border-border/50 animate-pulse" />
          <div className="h-20 bg-muted/30 rounded-2xl border border-dashed border-border/50 animate-pulse delay-75" />
          <div className="h-20 bg-muted/30 rounded-2xl border border-dashed border-border/50 animate-pulse delay-150" />
          <div className="h-20 bg-muted/30 rounded-2xl border border-dashed border-border/50 animate-pulse delay-300" />
        </div>
      </div>
    </div>
  );
};

export default GeneratingPlan;