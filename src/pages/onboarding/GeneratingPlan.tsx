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

  // Simulación de progreso visual
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Avanzar más rápido al principio, más lento al final
        const increment = prev < 50 ? 2 : prev < 80 ? 1 : 0.5;
        return Math.min(prev + increment, 99); // Esperar a la mutación para el 100
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Actualizar etapas de texto basado en el progreso
  useEffect(() => {
    if (progress < 30) setStage(0);
    else if (progress < 60) setStage(1);
    else if (progress < 90) setStage(2);
    else setStage(3);
  }, [progress]);

  const generatePlanMutation = useMutation({
    mutationFn: async () => {
      if (!profile || !user) throw new Error("Profile not loaded");

      // Datos por defecto si faltan
      const weightInKg = profile.weight || 70;
      const heightInCm = profile.height || 170;
      const isImperial = profile.units === 'imperial';
      
      // Conversiones necesarias para la IA
      const finalWeight = isImperial ? weightInKg * 0.453592 : weightInKg;
      const finalHeight = isImperial ? heightInCm * 2.54 : heightInCm;
      
      // Estimación básica si no tenemos datos precisos del onboarding de dieta
      const workoutsPerWeek = 3; 
      const goalWeight = profile.goal_weight ? (isImperial ? profile.goal_weight * 0.453592 : profile.goal_weight) : finalWeight;
      const weeklyRate = 0.5;

      const { data: suggestions, error: suggestionError } = await supabase.functions.invoke('calculate-macros', {
        body: {
          weight: finalWeight,
          height: finalHeight,
          gender: profile.gender || 'Not specified',
          age: profile.age || 25,
          goal: profile.goal || 'maintain_weight',
          goalWeight: goalWeight,
          weeklyRate: weeklyRate,
          workoutsPerWeek: workoutsPerWeek
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
      // Pequeña pausa para ver el 100%
      setTimeout(() => {
        navigate('/');
      }, 1500);
    },
    onError: (error) => {
      console.error("Error generating plan", error);
      // En caso de error, navegar igual para no bloquear al usuario
      navigate('/');
    }
  });

  // Ejecutar la mutación al montar
  useEffect(() => {
    if (user && profile) {
      generatePlanMutation.mutate();
    }
  }, [user, profile]); // Dependencias para asegurar que tenemos datos

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-12">
        
        {/* Icono animado central */}
        <div className="flex justify-center h-32 items-center">
          <motion.div
            key={stage}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="bg-primary/10 p-6 rounded-full"
          >
            {stages[stage].icon}
          </motion.div>
        </div>

        <div className="space-y-4 text-center">
          <motion.h2 
            key={stage + "text"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-foreground h-16 flex items-center justify-center"
          >
            {stages[stage].text}
          </motion.h2>
          
          <div className="space-y-2">
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-muted-foreground text-right font-mono">{Math.round(progress)}%</p>
          </div>
        </div>

        {/* Detalles decorativos */}
        <div className="grid grid-cols-2 gap-4 opacity-50 pointer-events-none">
          <div className="h-24 bg-muted/30 rounded-xl border border-dashed border-border/50 animate-pulse" />
          <div className="h-24 bg-muted/30 rounded-xl border border-dashed border-border/50 animate-pulse delay-75" />
          <div className="h-24 bg-muted/30 rounded-xl border border-dashed border-border/50 animate-pulse delay-150" />
          <div className="h-24 bg-muted/30 rounded-xl border border-dashed border-border/50 animate-pulse delay-300" />
        </div>
      </div>
    </div>
  );
};

export default GeneratingPlan;