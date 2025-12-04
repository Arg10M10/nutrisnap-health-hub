import { useMemo, useState } from "react";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Flame, ScanLine, Weight, Edit } from "lucide-react";
import RecentAnalysisCard from "@/components/RecentAnalysisCard";
import RecentExerciseCard from "@/components/RecentExerciseCard";
import { useNutrition, FoodEntry, ExerciseEntry } from "@/context/NutritionContext";
import { useAuth } from "@/context/AuthContext";
import ManualFoodEntry from "@/components/ManualFoodEntry";
import BmiCalculator from "@/components/BmiCalculator";
import StreakCalendar from "@/components/StreakCalendar";
import EditWeightDrawer from "@/components/EditWeightDrawer";
import WeightChart from "@/components/WeightChart";
import AnimatedNumber from "@/components/AnimatedNumber";
import AnalysisDetailDrawer from "@/components/AnalysisDetailDrawer";

const Progress = () => {
  const { getDataForDate, streak, streakDays } = useNutrition();
  const { profile } = useAuth();
  const { t } = useTranslation();
  const today = new Date();
  const [isWeightDrawerOpen, setIsWeightDrawerOpen] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<FoodEntry | null>(null);

  const { analyses } = getDataForDate(today);

  const chartData = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const day = subDays(new Date(), i);
      const { intake } = getDataForDate(day);
      return {
        day: format(day, "EEE", { locale: es }),
        calories: intake.calories || 0,
      };
    }).reverse();
  }, [getDataForDate]);

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
          onClick={() => setIsWeightDrawerOpen(true)}
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-primary" />
              {t('progress.calorie_intake')}
            </CardTitle>
            <CardDescription>{t('progress.last_7_days')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 10, bottom: 5, left: -16 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} className="capitalize" />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="calories" fill="hsl(var(--primary))" radius={8} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Today's History */}
        <div className="space-y-4">
          <h2 className="text-foreground text-2xl font-semibold flex items-center gap-2">
            <ScanLine className="w-7 h-7" />
            {t('progress.todays_history')}
          </h2>
          {analyses.length > 0 ? (
            <div className="space-y-3">
              {analyses.map((item) => {
                if ('food_name' in item) {
                  return (
                    <RecentAnalysisCard
                      key={item.id}
                      imageUrl={item.image_url}
                      foodName={item.food_name}
                      time={format(new Date(item.created_at), 'p', { locale: es })}
                      calories={item.calories_value}
                      protein={item.protein_value}
                      carbs={item.carbs_value}
                      fats={item.fats_value}
                      sugars={item.sugars_value}
                      status={item.status}
                      onClick={() => setSelectedAnalysis(item)}
                    />
                  );
                } else if ('exercise_type' in item) {
                  return <RecentExerciseCard key={item.id} entry={item as ExerciseEntry} />;
                }
                return null;
              })}
            </div>
          ) : (
            <Card className="p-8 flex flex-col items-center justify-center text-center space-y-2">
              <ScanLine className="w-12 h-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">{t('progress.no_scans')}</p>
            </Card>
          )}
        </div>

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
      <AnalysisDetailDrawer
        entry={selectedAnalysis}
        isOpen={!!selectedAnalysis}
        onClose={() => setSelectedAnalysis(null)}
      />
    </PageLayout>
  );
};

export default Progress;