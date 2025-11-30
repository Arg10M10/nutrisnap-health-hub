import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { GenderStep } from './steps/GenderStep';
import { AgeStep } from './steps/AgeStep';
import { ExperienceStep } from './steps/ExperienceStep';
import { MetricsStep } from './steps/MetricsStep';
import { DobStep } from './steps/DobStep';
import { GoalStep } from './steps/GoalStep';
import { FinalStep } from './steps/FinalStep';

const TOTAL_STEPS = 7;

const Onboarding = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    gender: null,
    age: '',
    experience: null,
    units: 'metric' as 'metric' | 'imperial',
    weight: '',
    height: '',
    dob: null as Date | null,
    goal: null,
  });

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not found');
      const { error } = await supabase
        .from('profiles')
        .update({
          gender: formData.gender,
          age: parseInt(formData.age),
          previous_apps_experience: formData.experience,
          units: formData.units,
          weight: parseFloat(formData.weight),
          height: parseFloat(formData.height),
          date_of_birth: formData.dob ? formData.dob.toISOString().split('T')[0] : null,
          goal: formData.goal,
          onboarding_completed: true,
        })
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('¡Todo listo! Bienvenido a NutriSnap.');
      window.location.reload();
    },
    onError: (error) => {
      toast.error('Hubo un error al guardar tu perfil.');
      console.error(error);
    },
  });

  const onContinue = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      mutation.mutate();
    }
  };

  const onBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const steps = [
    {
      title: '¿Cuál es tu género?',
      description: 'Esto nos ayuda a personalizar tus metas y recomendaciones.',
      content: <GenderStep gender={formData.gender} setGender={(v) => updateFormData('gender', v)} />,
      canContinue: !!formData.gender,
    },
    {
      title: '¿Cuál es tu edad?',
      description: 'Tu edad nos ayuda a calcular tus necesidades calóricas.',
      content: <AgeStep age={formData.age} setAge={(v) => updateFormData('age', v)} />,
      canContinue: !!formData.age && parseInt(formData.age) > 0,
    },
    {
      title: '¿Has probado otras apps?',
      description: 'Cuéntanos un poco sobre tu experiencia previa.',
      content: <ExperienceStep experience={formData.experience} setExperience={(v) => updateFormData('experience', v)} />,
      canContinue: !!formData.experience,
    },
    {
      title: 'Tus medidas',
      description: 'Introduce tu peso y altura para un seguimiento preciso.',
      content: <MetricsStep 
                  units={formData.units} setUnits={(v) => updateFormData('units', v)}
                  weight={formData.weight} setWeight={(v) => updateFormData('weight', v)}
                  height={formData.height} setHeight={(v) => updateFormData('height', v)}
                />,
      canContinue: !!formData.weight && !!formData.height,
    },
    {
      title: '¿Cuándo naciste?',
      description: 'Saber tu fecha de nacimiento nos ayuda a verificar tu edad.',
      content: <DobStep dob={formData.dob} setDob={(v) => updateFormData('dob', v)} />,
      canContinue: !!formData.dob,
    },
    {
      title: '¿Cuál es tu objetivo principal?',
      description: 'Elige qué quieres lograr con NutriSnap.',
      content: <GoalStep goal={formData.goal} setGoal={(v) => updateFormData('goal', v)} />,
      canContinue: !!formData.goal,
    },
    {
      title: '¡Estás a un paso!',
      description: 'Con NutriSnap, estás en el camino correcto hacia tus metas.',
      content: <FinalStep />,
      canContinue: true,
      continueText: 'Finalizar y empezar',
    },
  ];

  const currentStep = steps[step - 1];

  return (
    <OnboardingLayout
      step={step}
      totalSteps={TOTAL_STEPS}
      title={currentStep.title}
      description={currentStep.description}
      onContinue={onContinue}
      onBack={onBack}
      canContinue={currentStep.canContinue}
      isPending={mutation.isPending}
      continueText={currentStep.continueText}
    >
      {currentStep.content}
    </OnboardingLayout>
  );
};

export default Onboarding;