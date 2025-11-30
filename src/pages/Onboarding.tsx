import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ProgressBar from "@/components/onboarding/ProgressBar";
import Step1 from "@/components/onboarding/Step1";
import Step2 from "@/components/onboarding/Step2";
import Step3 from "@/components/onboarding/Step3";
import Step4 from "@/components/onboarding/Step4";
import Step5 from "@/components/onboarding/Step5";
import Step6 from "@/components/onboarding/Step6";
import Step7 from "@/components/onboarding/Step7";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { toast } from "sonner";

const TOTAL_STEPS = 7;

const Onboarding = () => {
  const { profile } = useSession();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    gender: "",
    age: undefined,
    weight: undefined,
    height: undefined,
    main_goal: "",
    target_weight: undefined,
    activity_level: "",
    exercise_days_per_week: undefined,
    dietary_preferences: "none",
    allergies: [],
    water_intake: undefined,
    sleep_hours: undefined,
    app_preferences: {
      ai_scanner: true,
      smart_reminders: true,
      personalized_recommendations: true,
    },
  });

  const nextStep = () => setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const updateFormData = (newData: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const handleFinish = async () => {
    if (!profile) return;

    const { error } = await supabase
      .from("profiles")
      .update({ ...formData, onboarding_completed: true })
      .eq("id", profile.id);

    if (error) {
      toast.error("Hubo un error al guardar tu perfil.");
      console.error(error);
    } else {
      toast.success("¡Perfil completado! Bienvenido a NutriSnap.");
      window.location.reload();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1: return <Step1 data={formData} update={updateFormData} next={nextStep} />;
      case 2: return <Step2 data={formData} update={updateFormData} next={nextStep} prev={prevStep} />;
      case 3: return <Step3 data={formData} update={updateFormData} next={nextStep} prev={prevStep} />;
      case 4: return <Step4 data={formData} update={updateFormData} next={nextStep} prev={prevStep} />;
      case 5: return <Step5 data={formData} update={updateFormData} next={nextStep} prev={prevStep} />;
      case 6: return <Step6 data={formData} update={updateFormData} next={nextStep} prev={prevStep} />;
      case 7: return <Step7 prev={prevStep} finish={handleFinish} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-4 md:items-center md:justify-center">
      <div className="w-full max-w-2xl flex-grow flex flex-col justify-between space-y-8 pt-8 md:pt-0">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-primary">
            Paso {step}/{TOTAL_STEPS}
          </span>
          <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} />
        </div>
        
        <div className="flex-grow flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;