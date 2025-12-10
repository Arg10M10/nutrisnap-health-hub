import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { GenderStep } from './steps/GenderStep';
import { AgeStep } from './steps/AgeStep';
import { ExperienceStep } from './steps/ExperienceStep';
import { MetricsStep } from './steps/MetricsStep';
import { MotivationStep } from './steps/MotivationStep';
import { GoalStep } from './steps/GoalStep';
import { GoalWeightStep } from './steps/GoalWeightStep';
import { FinalStep } from './steps/FinalStep';

const TOTAL_STEPS = 8;

const Onboarding = () => {
  const { user, refetchProfile } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    gender: null as string | null,
    age: null as number | null,
    experience: null as string | null,
    units: 'metric' as 'metric' | 'imperial',
    weight: null as number | null,
    height: null as number | null,
    motivation: null as string | null,
    goal: null as string | null,
    goalWeight: null as number | null,
  });

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user || !formData.weight) throw new Error('User or weight not found');
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          gender: formData.gender,
          age: formData.age,
          previous_apps_experience: formData.experience,
          units: formData.units,
          weight: formData.weight,
          starting_weight: formData.weight,
          height: formData.height,
          motivation: formData.motivation,
          goal: formData.goal,
          goal_weight: formData.goalWeight,
          onboarding_completed: true,
        })
        .eq('id', user.id);
      if (profileError) throw profileError;

      const { error: historyError } = await supabase
        .from('weight_history')
        .insert({ user_id: user.id, weight: formData.weight });
      if (historyError) throw historyError;
    },
    onSuccess: async () => {
      await refetchProfile();
      navigate('/subscribe');
    },
    onError: (error) => {
      toast.error(t('onboarding.toast_error'));
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
      title: t('onboarding.gender.title'),
      description: t('onboarding.gender.description'),
      content: <GenderStep gender={formData.gender} setGender={(v) => updateFormData('gender', v)} />,
      canContinue: !!formData.gender,
    },
    {
      title: t('onboarding.age.title'),
      description: t('onboarding.age.description'),
      content: <AgeStep age={formData.age} setAge={(v) => updateFormData('age', v)} />,
      canContinue: formData.age !== null && formData.age > 0,
    },
    {
      title: t('onboarding.experience.title'),
      description: t('onboarding.experience.description'),
      content: <ExperienceStep experience={formData.experience} setExperience={(v) => updateFormData('experience', v)} />,
      canContinue: !!formData.experience,
    },
    {
      title: t('onboarding.metrics.title'),
      description: t('onboarding.metrics.description'),
      content: <MetricsStep 
                  units={formData.units} setUnits={(v) => updateFormData('units', v)}
                  weight={formData.weight} setWeight={(v) => updateFormData('weight', v)}
                  height={formData.height} setHeight={(v) => updateFormData('height', v)}
                />,
      canContinue: formData.weight !== null && formData.height !== null,
    },
    {
      title: t('onboarding.motivation.title'),
      description: t('onboarding.motivation.description'),
      content: <MotivationStep motivation={formData.motivation} setMotivation={(v) => updateFormData('motivation', v)} />,
      canContinue: !!formData.motivation,
    },
    {
      title: t('onboarding.goal.title'),
      description: t('onboarding.goal.description'),
      content: <GoalStep goal={formData.goal} setGoal={(v) => updateFormData('goal', v)} />,
      canContinue: !!formData.goal,
    },
    {
      title: t('onboarding.goal_weight.title'),
      description: t('onboarding.goal_weight.description'),
      content: <GoalWeightStep 
                  goalWeight={formData.goalWeight} 
                  setGoalWeight={(v) => updateFormData('goalWeight', v)}
                  units={formData.units}
                  setUnits={(v) => updateFormData('units', v)}
                />,
      canContinue: formData.goalWeight !== null,
    },
    {
      title: t('onboarding.final.title'),
      description: t('onboarding.final.description'),
      content: <FinalStep />,
      canContinue: true,
      continueText: t('onboarding.final.button'),
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
      hideContinueButton={currentStep.hideContinueButton}
    >
      {currentStep.content}
    </OnboardingLayout>
  );
};

export default Onboarding;