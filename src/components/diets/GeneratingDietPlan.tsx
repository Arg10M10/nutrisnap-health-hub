import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Brain, Calculator, CheckCircle2, ChefHat, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { countries } from "@/data/countries";

interface GeneratingDietPlanProps {
  countryValue: string;
  onAnimationComplete: () => void;
}

const GeneratingDietPlan = ({ countryValue, onAnimationComplete }: GeneratingDietPlanProps) => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);

  const countryObject = countries.find(c => c.value === countryValue);
  const countryLabel = countryObject ? t(countryObject.labelKey as any) : null;

  const stages = [
    { 
      text: t('diets_onboarding.generating_step1'), 
      icon: <Brain className="w-12 h-12 text-primary" /> 
    },
    { 
      text: countryLabel 
        ? t('diets_onboarding.generating_step2', { country: countryLabel }) 
        : t('diets_onboarding.generating_step2_generic'), 
      icon: <Globe className="w-12 h-12 text-blue-500" /> 
    },
    { 
      text: t('diets_onboarding.generating_step3'), 
      icon: <Calculator className="w-12 h-12 text-purple-500" /> 
    },
    { 
      text: t('diets_onboarding.generating_step4'), 
      icon: <ChefHat className="w-12 h-12 text-orange-500" /> 
    },
    { 
      text: t('diets_onboarding.generating_step5'), 
      icon: <CheckCircle2 className="w-12 h-12 text-green-500" /> 
    },
  ];

  useEffect(() => {
    // Objetivo: 100% en 70 segundos (70000ms)
    // Actualización cada 100ms
    // Total de pasos: 700
    // Incremento por paso: 100 / 700 = ~0.1428
    
    const totalDuration = 70000; // 70 segundos
    const intervalTime = 100;
    const totalSteps = totalDuration / intervalTime;
    const increment = 100 / totalSteps;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          onAnimationComplete();
          return 100;
        }
        // Añadir una pequeña variabilidad aleatoria para que parezca más "orgánico"
        const jitter = (Math.random() - 0.5) * 0.05; 
        return Math.min(prev + increment + jitter, 100);
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [onAnimationComplete]);

  // Sincronizar etapas con el progreso
  useEffect(() => {
    // 5 etapas
    // 0-20, 20-40, 40-60, 60-80, 80-100
    if (progress < 20) setStage(0);
    else if (progress < 40) setStage(1);
    else if (progress < 60) setStage(2);
    else if (progress < 80) setStage(3);
    else setStage(4);
  }, [progress]);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] p-6 text-center animate-in fade-in zoom-in duration-500">
      <div className="w-full max-w-md space-y-12">
        <div className="flex justify-center h-40 items-center mb-8 relative">
          {/* Anillos decorativos animados de fondo */}
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-32 h-32 border-4 border-primary/20 rounded-full animate-ping opacity-20" style={{ animationDuration: '3s' }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-48 h-48 border-4 border-primary/10 rounded-full animate-ping opacity-10 delay-1000" style={{ animationDuration: '4s' }} />
          </div>

          <motion.div
            key={stage}
            initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotate: 20 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="bg-card p-8 rounded-full shadow-2xl border-4 border-muted relative z-10"
          >
            {stages[stage].icon}
          </motion.div>
        </div>

        <div className="space-y-8">
          <motion.h2 
            key={stage + "text"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-foreground min-h-[4rem] flex items-end justify-center leading-tight"
          >
            {stages[stage].text}
          </motion.h2>
          
          <div className="space-y-3 px-2">
            <Progress value={progress} className="h-3 rounded-full" />
            <div className="flex justify-between text-xs font-mono font-medium text-muted-foreground">
                <span>{t('diets_onboarding.ai_processing')}</span>
                <span>{Math.floor(progress)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratingDietPlan;