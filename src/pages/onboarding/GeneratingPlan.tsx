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

  // Simulación de progreso visual - Ajustado para ~30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 99) {
          // Esperar a que termine la mutación
          return 99;
        }
        
        // Lógica para durar aprox 30 segundos
        // Intervalo: 100ms
        let increment = 0;
        
        if (prev < 30) {
          increment = 1.5; // Rápido al inicio (~2s)
        } else if (prev < 70) {
          increment = 0.4; // Medio (~10s)
        } else if (prev < 90) {
          increment = 0.2; // Lento (~10s)
        } else {
          increment = 0.1; // Muy lento al final (~9s)
        }
        
        // Añadir un poco de aleatoriedad para que se sienta natural
        increment += (Math.random() - 0.5) * 0.1;
        
        return Math.min(prev + Math.max(0.05, increment), 99);
      });
    }, 100);

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
      navigate('/');
    }
  });

  // Ejecutar la mutación al montar
  useEffect(() => {
    if (user && profile) {
      generatePlanMutation.mutate();
    }
  }, [user, profile]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-12">
        
        {/* Icono animado central */}
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

        {/* Sección de Texto y Barra con más espacio */}
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

        {/* Detalles decorativos */}
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