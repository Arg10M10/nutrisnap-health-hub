import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { GoalSlider } from '@/components/settings/GoalSlider';

const NutritionalGoals = () => {
  const navigate = useNavigate();
  const { profile, user, refetchProfile } = useAuth();
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
          <h1 className="text-2xl font-bold text-primary">Nutritional Goals</h1>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Daily Goals</CardTitle>
            <CardDescription>Adjust the sliders to set your daily nutritional targets.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <GoalSlider label="Calories" value={goals.calories} onValueChange={(v) => handleGoalChange('calories', v)} min={1000} max={4000} step={50} unit="kcal" />
            <GoalSlider label="Protein" value={goals.protein} onValueChange={(v) => handleGoalChange('protein', v)} min={20} max={200} step={5} unit="g" />
            <GoalSlider label="Carbohydrates" value={goals.carbs} onValueChange={(v) => handleGoalChange('carbs', v)} min={50} max={400} step={10} unit="g" />
            <GoalSlider label="Fats" value={goals.fats} onValueChange={(v) => handleGoalChange('fats', v)} min={20} max={150} step={5} unit="g" />
            <GoalSlider label="Sugars" value={goals.sugars} onValueChange={(v) => handleGoalChange('sugars', v)} min={10} max={100} step={5} unit="g" />
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
            Save Goals
          </Button>
        </div>
      </footer>
    </PageLayout>
  );
};

export default NutritionalGoals;