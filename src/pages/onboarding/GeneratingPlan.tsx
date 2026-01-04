import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Brain, Calculator, CheckCircle2, Utensils } from "lucide-react";
import { useTranslation } from "react-i18next";

const GeneratingPlan = () => {
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

  useEffect(() => {
    // Animación visual de 4 segundos para dar sensación de "preparación"
    const totalDuration = 4000; 
    const intervalTime = 50;
    const totalSteps = totalDuration / intervalTime;
    const increment = 100 / totalSteps;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
             navigate('/goal-projection', { replace: true });
          }, 500);
          return 100;
        }
        return Math.min(prev + increment, 100);
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    if (progress < 25) setStage(0);
    else if (progress < 50) setStage(1);
    else if (progress < 85) setStage(2);
    else setStage(3);
  }, [progress]);

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
      </div>
    </div>
  );
};

export default GeneratingPlan;