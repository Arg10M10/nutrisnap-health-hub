import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { GoalInput } from '@/components/settings/GoalInput';

const NutritionalGoals = () => {
  const navigate = useNavigate();
  const { profile, user, refetchProfile } = useAuth();
  const { t } = useTranslation();
  const [goals, setGoals] = useState({
    calories: 2000,
    protein: 90,
    carbs: 220,
    fats: 65,
    sugars: 25,
  });

  useEffect(() => {
    if (profile) {
      setGoals({
        calories: profile.goal_calories || 2000,
        protein: profile.goal_protein || 90,
        carbs: profile.goal_carbs || 220,
        fats: profile.goal_fats || 65,
        sugars: profile.goal_sugars || 25,
      });
    }
  }, [profile]);

  const handleGoalChange = (goal: keyof typeof goals, value: number) => {
    setGoals(prev => ({ ...prev, [goal]: value }));
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not found');
      const { error } = await supabase
        .from('profiles')
        .update({
          goal_calories: goals.calories,
          goal_protein: goals.protein,
          goal_carbs: goals.carbs,
          goal_fats: goals.fats,
          goal_sugars: goals.sugars,
        })
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await refetchProfile();
      toast.success('Nutritional goals updated!');
      navigate(-1);
    },
    onError: (error) => {
      toast.error('Could not update goals.', { description: error.message });
    },
  });

  return (
    <PageLayout>
      <div className="space-y-8 pb-24">
        <header className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">{t('nutritional_goals.title')}</h1>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>{t('nutritional_goals.daily_goals')}</CardTitle>
            <CardDescription>{t('nutritional_goals.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex justify-center">
              <GoalInput
                label={t('nutritional_goals.calories')}
                value={goals.calories}
                unit="kcal"
                onChange={(v) => handleGoalChange('calories', v)}
                color="text-primary"
                size="large"
              />
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8">
              <GoalInput
                label={t('nutritional_goals.protein')}
                value={goals.protein}
                unit="g"
                onChange={(v) => handleGoalChange('protein', v)}
                color="text-red-500"
              />
              <GoalInput
                label={t('nutritional_goals.carbs')}
                value={goals.carbs}
                unit="g"
                onChange={(v) => handleGoalChange('carbs', v)}
                color="text-orange-500"
              />
              <GoalInput
                label={t('nutritional_goals.fats')}
                value={goals.fats}
                unit="g"
                onChange={(v) => handleGoalChange('fats', v)}
                color="text-blue-500"
              />
              <GoalInput
                label={t('nutritional_goals.sugars')}
                value={goals.sugars}
                unit="g"
                onChange={(v) => handleGoalChange('sugars', v)}
                color="text-purple-500"
              />
            </div>
          </CardContent>
        </Card>
      </div>
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t">
        <div className="max-w-2xl mx-auto">
          <Button
            size="lg"
            className="w-full h-14 text-lg"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {t('nutritional_goals.save')}
          </Button>
        </div>
      </footer>
    </PageLayout>
  );
};

export default NutritionalGoals;