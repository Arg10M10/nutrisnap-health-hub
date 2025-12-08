import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { startOfDay } from "date-fns";
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

  const { data: todaysWeightUpdatesCount } = useQuery({
    queryKey: ['todays_weight_updates_count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const todayStart = startOfDay(new Date()).toISOString();
      const { count, error } = await supabase
        .from('weight_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', todayStart);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user,
  });

  const hasReachedDailyWeightUpdateLimit = useMemo(() => {
    return (todaysWeightUpdatesCount ?? 0) >= 2;
  }, [todaysWeightUpdatesCount]);

  const handleOpenWeightDrawer = () => {
    setIsWeightDrawerOpen(true);
  };

  const isImperial = profile?.units === 'imperial';
  // Convert kg to lbs if imperial (1 kg = 2.20462 lbs)
  const displayWeight = isImperial && profile?.weight 
    ? profile.weight * 2.20462 
    : (profile?.weight || 0);
  
  const weightUnit = isImperial ? 'lbs' : 'kg';

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
              <AnimatedNumber value={displayWeight} toFixed={1} />
            </p>
            <p className="text-sm text-muted-foreground">{weightUnit}</p>
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
          disabled={hasReachedDailyWeightUpdateLimit}
        >
          {hasReachedDailyWeightUpdateLimit ? (
            t('progress.weight_updated_today')
          ) : (
            <>
              <Edit className="mr-2 h-5 w-5" />
              {t('progress.update_weight')}
            </>
          )}
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
        currentWeight={displayWeight}
      />
    </PageLayout>
  );
};

export default Progress;