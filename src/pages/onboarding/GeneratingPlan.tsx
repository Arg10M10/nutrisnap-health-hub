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
    { text: t('generating_plan.step1'), icon: <Brain className="w-8 h-8 text-primary" /> },
    { text: t('generating_plan.step2'), icon: <Calculator className="w-8 h-8 text-blue-500" /> },
    { text: t('generating_plan.step3'), icon: <Utensils className="w-8 h-8 text-orange-500" /> },
    { text: t('generating_plan.step4'), icon: <CheckCircle2 className="w-8 h-8 text-green-500" /> },
  ];

  // Simulación de progreso visual - Ajustado para ~25 segundos
  useEffect(() => {
    const totalDuration = 25000; // 25 segundos
    const intervalTime = 100;
    const totalSteps = totalDuration / intervalTime;
    const increment = 100 / totalSteps;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 99) {
          // Pausa en 99% esperando que la API termine si tarda más de 25s
          return 99;
        }
        return Math.min(prev + increment, 99);
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress < 25) setStage(0);
    else if (progress < 50) setStage(1);
    else if (progress < 85) setStage(2);
    else setStage(3);
  }, [progress]);

  const generatePlanMutation = useMutation({
    mutationFn: async () => {
      if (!profile || !user) throw new Error("Profile not loaded");

      const weightInKg = profile.weight || 70;
      const heightInCm = profile.height || 170;
      const isImperial = profile.units === 'imperial';
      
      const finalWeight = isImperial ? weightInKg * 0.453592 : weightInKg;
      const finalHeight = isImperial ? heightInCm * 2.54 : heightInCm;
      
      let estimatedWorkouts = 3;
      if (profile.previous_apps_experience) {
        const exp = profile.previous_apps_experience.toLowerCase();
        if (exp.includes("first time")) estimatedWorkouts = 1;
        else if (exp.includes("one or two")) estimatedWorkouts = 3;
        else if (exp.includes("several")) estimatedWorkouts = 5;
      }

      let goalWeight = profile.goal_weight;
      if (profile.goal === 'maintain_weight' || !goalWeight) {
        goalWeight = finalWeight;
      } else if (isImperial) {
        goalWeight = goalWeight * 0.453592;
      }
      
      let weeklyRate = profile.weekly_rate || 0.5;
      if (profile.goal === 'maintain_weight') {
        weeklyRate = 0;
      } else if (isImperial) {
        weeklyRate = weeklyRate * 0.453592;
      }

      const { data: suggestions, error: suggestionError } = await supabase.functions.invoke('calculate-macros', {
        body: {
          weight: finalWeight,
          height: finalHeight,
          gender: profile.gender || 'male',
          age: profile.age || 30,
          goal: profile.goal || 'maintain_weight',
          goalWeight: goalWeight,
          weeklyRate: weeklyRate, 
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
        // CAMBIO: Redirigir a la nueva pantalla de proyección
        navigate('/goal-projection');
      }, 1500);
    },
    onError: (error) => {
      console.error("Error generating plan", error);
      // Fallback a home en caso de error
      navigate('/');
    }
  });

  useEffect(() => {
    if (user && profile) {
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
            <Progress value={progress} className="h-4 rounded-full transition-all duration-300 ease-linear" />
            <p className="text-sm text-muted-foreground text-right font-mono font-medium">{Math.floor(progress)}%</p>
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