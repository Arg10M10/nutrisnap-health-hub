import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Flame, Beef, Wheat, Droplets, Sparkles, Wand2, Sprout } from 'lucide-react';
import { GoalRow } from '@/components/settings/GoalRow';
import { useDebouncedCallback } from 'use-debounce';

const NutritionalGoals = () => {
  const navigate = useNavigate();
  const { profile, user, refetchProfile, saveLocalProfile } = useAuth();
  const { t } = useTranslation();
  const [goals, setGoals] = useState({
    calories: 2000,
    protein: 90,
    carbs: 220,
    fats: 65,
    sugars: 25,
    fiber: 30,
  });

  useEffect(() => {
    if (profile) {
      setGoals({
        calories: profile.goal_calories || 2000,
        protein: profile.goal_protein || 90,
        carbs: profile.goal_carbs || 220,
        fats: profile.goal_fats || 65,
        sugars: profile.goal_sugars || 25,
        fiber: profile.goal_fiber || 30,
      });
    }
  }, [profile]);

  const mutation = useMutation({
    mutationFn: async (updatedGoals: typeof goals) => {
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            goal_calories: updatedGoals.calories,
            goal_protein: updatedGoals.protein,
            goal_carbs: updatedGoals.carbs,
            goal_fats: updatedGoals.fats,
            goal_sugars: updatedGoals.sugars,
            goal_fiber: updatedGoals.fiber,
            updated_at: new Date().toISOString()
          })
          .select();
          
        if (error) throw error;
      } else {
        saveLocalProfile({
            goal_calories: updatedGoals.calories,
            goal_protein: updatedGoals.protein,
            goal_carbs: updatedGoals.carbs,
            goal_fats: updatedGoals.fats,
            goal_sugars: updatedGoals.sugars,
            goal_fiber: updatedGoals.fiber,
        });
      }
    },
    onSuccess: async () => {
      if (user) await refetchProfile();
    },
    onError: (error) => {
      console.error("Error saving goals:", error);
      toast.error(t('nutritional_goals.save_error'), { description: error.message });
    },
  });

  const debouncedSave = useDebouncedCallback((newGoals) => {
    mutation.mutate(newGoals);
  }, 1000);

  const handleGoalChange = (goal: keyof typeof goals, value: number) => {
    const newGoals = { ...goals, [goal]: value };
    setGoals(newGoals);
    debouncedSave(newGoals);
  };

  const goalsConfig = [
    { id: 'calories', label: t('nutritional_goals.calories'), unit: 'kcal', icon: <Flame className="w-5 h-5 text-white" />, color: 'bg-primary' },
    { id: 'protein', label: t('nutritional_goals.protein'), unit: 'g', icon: <Beef className="w-5 h-5 text-white" />, color: 'bg-red-500' },
    { id: 'carbs', label: t('nutritional_goals.carbs'), unit: 'g', icon: <Wheat className="w-5 h-5 text-white" />, color: 'bg-orange-500' },
    { id: 'fats', label: t('nutritional_goals.fats'), unit: 'g', icon: <Droplets className="w-5 h-5 text-white" />, color: 'bg-blue-500' },
    { id: 'sugars', label: t('nutritional_goals.sugars'), unit: 'g', icon: <Sparkles className="w-5 h-5 text-white" />, color: 'bg-purple-500' },
    { id: 'fiber', label: t('nutritional_goals.fiber'), unit: 'g', icon: <Sprout className="w-5 h-5 text-white" />, color: 'bg-emerald-500' },
  ];

  return (
    <PageLayout>
      <div className="space-y-8">
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
          <CardContent className="p-0">
            <div className="divide-y px-6">
              {goalsConfig.map((goal) => (
                <GoalRow
                  key={goal.id}
                  icon={goal.icon}
                  label={goal.label}
                  value={goals[goal.id as keyof typeof goals]}
                  unit={goal.unit}
                  onChange={(v) => handleGoalChange(goal.id as keyof typeof goals, v)}
                  color={goal.color}
                />
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2 pt-6">
             <Button variant="outline" size="lg" className="w-full h-14 text-lg" onClick={() => navigate('/settings/ai-suggestions')}>
                <Wand2 className="mr-2 h-5 w-5" />
                {t('nutritional_goals.ai_suggestions')}
             </Button>
          </CardFooter>
        </Card>
      </div>
    </PageLayout>
  );
};

export default NutritionalGoals;