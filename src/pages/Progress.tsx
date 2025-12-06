import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { isToday } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PageLayout from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Weight, Edit } from "lucide-react";
import { useNutrition } from "@/context/NutritionContext";
import { useAuth } from "@/context/AuthContext";
import ManualFoodEntry from "@/components/ManualFoodEntry";
import BmiCalculator from "@/components/BmiCalculator";
import StreakCalendar from "@/components/StreakCalendar";
import EditWeightDrawer from "@/components/EditWeightDrawer";
import WeightChart from "@/components/WeightChart";
import AnimatedNumber from "@/components/AnimatedNumber";
import CalorieIntakeChart from "@/components/CalorieIntakeChart";

const Progress = () => {
  const { streak, streakDays } = useNutrition();
  const { profile, user } = useAuth();
  const { t } = useTranslation();
  const [isWeightDrawerOpen, setIsWeightDrawerOpen] = useState(false);

  const { data: lastWeightEntry } = useQuery({
    queryKey: ['last_weight_entry', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('weight_history')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleOpenWeightDrawer = () => {
    if (lastWeightEntry) {
      const lastEntryDate = new Date(lastWeightEntry.created_at);
      if (isToday(lastEntryDate)) {
        toast.info("Ya has actualizado tu peso hoy.", {
          description: "Puedes actualizar tu peso de nuevo mañana.",
        });
        return;
      }
    }
    setIsWeightDrawerOpen(true);
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-primary">{t('progress.title')}</h1>
          <p className="text-muted-foreground text-lg">
            {t('progress.subtitle')}
          </p>
        </div>

        {/* Weight & Streak Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="aspect-square flex flex-col items-center justify-center p-4 text-center">
            <Weight className="w-10 h-10 text-primary" />
            <p className="text-5xl font-bold text-foreground mt-2">
              <AnimatedNumber value={profile?.weight || 0} toFixed={1} />
            </p>
            <p className="text-sm text-muted-foreground">{t('progress.weight_unit')}</p>
          </Card>
          <Card className="aspect-square flex flex-col items-center justify-center p-4 text-center">
            <p className="text-5xl font-bold text-foreground">
              <AnimatedNumber value={streak} />
            </p>
            <p className="text-sm text-muted-foreground mb-3">{streak === 1 ? t('progress.day_streak') : t('progress.day_streaks')}</p>
            <StreakCalendar streakDays={streakDays} />
          </Card>
        </div>

        {/* Edit Weight Button */}
        <Button
          onClick={handleOpenWeightDrawer}
          variant="outline"
          size="lg"
          className="w-full h-14 text-lg"
        >
          <Edit className="mr-2 h-5 w-5" />
          {t('progress.update_weight')}
        </Button>

        {/* Weight Chart */}
        <WeightChart />

        {/* BMI Calculator */}
        <BmiCalculator size="small" />

        {/* Calories Chart */}
        <CalorieIntakeChart />

        {/* Manual Food Entry */}
        <div className="space-y-4">
          <ManualFoodEntry />
        </div>
      </div>
      <EditWeightDrawer 
        isOpen={isWeightDrawerOpen} 
        onClose={() => setIsWeightDrawerOpen(false)} 
        currentWeight={profile?.weight || 70}
      />
    </PageLayout>
  );
};

export default Progress;