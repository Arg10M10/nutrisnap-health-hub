import { useMemo, useState } from "react";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Flame, Weight, Edit } from "lucide-react";
import { useNutrition } from "@/context/NutritionContext";
import { useAuth } from "@/context/AuthContext";
import ManualFoodEntry from "@/components/ManualFoodEntry";
import BmiCalculator from "@/components/BmiCalculator";
import StreakCalendar from "@/components/StreakCalendar";
import EditWeightDrawer from "@/components/EditWeightDrawer";
import WeightChart from "@/components/WeightChart";
import AnimatedNumber from "@/components/AnimatedNumber";

const Progress = () => {
  const { getDataForDate, streak, streakDays } = useNutrition();
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [isWeightDrawerOpen, setIsWeightDrawerOpen] = useState(false);

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
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 5, left: -16 }}>
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    className="capitalize"
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 12,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                    }}
                    labelStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <Bar
                    dataKey="calories"
                    fill="hsl(var(--primary))"
                    radius={[8, 8, 8, 8]}
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

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