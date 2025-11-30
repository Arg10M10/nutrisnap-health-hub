import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ProgressBar from "@/components/onboarding/ProgressBar";
import Step1 from "@/components/onboarding/Step1";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const TOTAL_STEPS = 7;

const Onboarding = () => {
  const { profile } = useSession();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    gender: "",
    age: 0,
    weight: 0,
    height: 0,
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
      // This will trigger a profile refresh in the context, which will cause App.tsx to navigate
      window.location.reload();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1 data={formData} update={updateFormData} next={nextStep} />;
      // Other steps will be added here
      default:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">¡Todo listo!</h2>
            <p className="text-muted-foreground mb-6">
              Has completado tu perfil. ¡Estás listo para empezar tu viaje hacia una vida más saludable!
            </p>
            <button onClick={handleFinish} className="bg-primary text-white px-6 py-3 rounded-lg">
              Finalizar y Empezar
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-primary">
            Paso {step}/{TOTAL_STEPS}
          </span>
          <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;