import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
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
import { WeeklyRateStep } from './steps/WeeklyRateStep';
import { NotificationsStep } from './steps/NotificationsStep';
import { FinalStep } from './steps/FinalStep';

const Onboarding = () => {
  const { saveLocalProfile } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
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
    weeklyRate: null as number | null,
  });

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFinish = async () => {
    try {
      // Lógica inteligente para "Mantener peso"
      let finalGoalWeight = formData.goalWeight;
      let finalWeeklyRate = formData.weeklyRate;

      if (formData.goal === 'maintain_weight') {
        finalGoalWeight = formData.weight;
        finalWeeklyRate = 0;
      }

      // Guardar localmente
      saveLocalProfile({
        gender: formData.gender,
        age: formData.age,
        previous_apps_experience: formData.experience,
        units: formData.units,
        weight: formData.weight,
        starting_weight: formData.weight,
        height: formData.height,
        motivation: formData.motivation,
        goal: formData.goal,
        goal_weight: finalGoalWeight,
        weekly_rate: finalWeeklyRate,
        onboarding_completed: true,
        full_name: 'Guest User', // Placeholder
        is_subscribed: false, // Default to false
      });

      // Ir a la pantalla de suscripción, indicando que venimos del onboarding
      navigate('/subscribe', { state: { fromOnboarding: true } });
      
    } catch (error) {
      console.error("Onboarding Save Error:", error);
      toast.error(t('onboarding.toast_error'));
    }
  };

  const nextStep = () => {
    if (currentStepIndex < allSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      
      const nextStep = allSteps[currentStepIndex + 1];
      if (nextStep && nextStep.id === 'weekly_rate' && formData.weeklyRate === null) {
        updateFormData('weeklyRate', formData.units === 'metric' ? 0.5 : 1.1);
      }
      if (nextStep && nextStep.id === 'goal_weight' && formData.goalWeight === null && formData.weight) {
         const suggestion = formData.goal === 'lose_weight' ? formData.weight * 0.9 : formData.weight * 1.1;
         updateFormData('goalWeight', Math.round(suggestion));
      }
    } else {
      handleFinish();
    }
  };

  const onBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const allSteps = [
    {
      id: 'gender',
      title: t('onboarding.gender.title'),
      description: t('onboarding.gender.description'),
      content: <GenderStep gender={formData.gender} setGender={(v) => updateFormData('gender', v)} />,
      canContinue: !!formData.gender,
    },
    {
      id: 'age',
      title: t('onboarding.age.title'),
      description: t('onboarding.age.description'),
      content: <AgeStep age={formData.age} setAge={(v) => updateFormData('age', v)} />,
      canContinue: formData.age !== null && formData.age > 0,
    },
    {
      id: 'experience',
      title: t('onboarding.experience.title'),
      description: t('onboarding.experience.description'),
      content: <ExperienceStep experience={formData.experience} setExperience={(v) => updateFormData('experience', v)} />,
      canContinue: !!formData.experience,
    },
    {
      id: 'metrics',
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
      id: 'motivation',
      title: t('onboarding.motivation.title'),
      description: t('onboarding.motivation.description'),
      content: <MotivationStep motivation={formData.motivation} setMotivation={(v) => updateFormData('motivation', v)} />,
      canContinue: !!formData.motivation,
    },
    {
      id: 'goal',
      title: t('onboarding.goal.title'),
      description: t('onboarding.goal.description'),
      content: <GoalStep goal={formData.goal} setGoal={(v) => updateFormData('goal', v)} />,
      canContinue: !!formData.goal,
    },
    ...(formData.goal !== 'maintain_weight' ? [
      {
        id: 'goal_weight',
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
        id: 'weekly_rate',
        title: t('onboarding.weekly_rate.title'),
        description: t('onboarding.weekly_rate.description'),
        content: <WeeklyRateStep
                    weeklyRate={formData.weeklyRate}
                    setWeeklyRate={(v) => updateFormData('weeklyRate', v)}
                    units={formData.units}
                    goal={formData.goal}
                  />,
        canContinue: formData.weeklyRate !== null,
      }
    ] : []),
    {
      id: 'notifications',
      title: t('onboarding.notifications.title'),
      description: t('onboarding.notifications.description'),
      content: <NotificationsStep onNext={nextStep} />,
      canContinue: true,
      hideContinueButton: true,
    },
    {
      id: 'final',
      title: t('onboarding.final.title'),
      description: t('onboarding.final.description'),
      content: <FinalStep />,
      canContinue: true,
      continueText: t('onboarding.final.button'),
    },
  ];

  const totalSteps = allSteps.length;
  const currentStep = allSteps[currentStepIndex];

  return (
    <OnboardingLayout
      step={currentStepIndex + 1}
      totalSteps={totalSteps}
      title={currentStep.title}
      description={currentStep.description}
      onContinue={nextStep}
      onBack={onBack}
      canContinue={currentStep.canContinue}
      isPending={false} 
      continueText={currentStep.continueText}
      hideContinueButton={currentStep.hideContinueButton}
    >
      {currentStep.content}
    </OnboardingLayout>
  );
};

export default Onboarding;