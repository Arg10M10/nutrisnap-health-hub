import { useMemo, useState } from "react";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Flame, ScanLine, Weight, Edit } from "lucide-react";
import RecentAnalysisCard from "@/components/RecentAnalysisCard";
import { useNutrition } from "@/context/NutritionContext";
import { useAuth } from "@/context/AuthContext";
import ManualFoodEntry from "@/components/ManualFoodEntry";
import BmiCalculator from "@/components/BmiCalculator";
import StreakCalendar from "@/components/StreakCalendar";
import EditWeightDrawer from "@/components/EditWeightDrawer";
import WeightChart from "@/components/WeightChart";

const Progress = () => {
  const { getDataForDate, streak, streakDays } = useNutrition();
  const { profile } = useAuth();
  const today = new Date();
  const [isWeightDrawerOpen, setIsWeightDrawerOpen] = useState(false);

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
          <h1 className="text-primary">Tu Progreso</h1>
          <p className="text-muted-foreground text-lg">
            Visualiza tus hábitos y avances a lo largo del tiempo.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="aspect-square flex flex-col items-center justify-center p-4 text-center">
            <Weight className="w-10 h-10 text-primary" />
            <p className="text-5xl font-bold text-foreground mt-2">
              {profile?.weight ? profile.weight : 'N/A'}
            </p>
            <p className="text-sm text-muted-foreground">kg</p>
          </Card>
          <Card className="aspect-square flex flex-col items-center justify-center p-4 text-center">
            <p className="text-5xl font-bold text-foreground">
              {streak}
            </p>
            <p className="text-sm text-muted-foreground mb-3">{streak === 1 ? 'día de racha' : 'días de racha'}</p>
            <StreakCalendar streakDays={streakDays} />
          </Card>
        </div>

        <Button
          onClick={() => setIsWeightDrawerOpen(true)}
          variant="outline"
          size="lg"
          className="w-full h-14 text-lg"
        >
          <Edit className="mr-2 h-5 w-5" />
          Actualizar mi peso
        </Button>

        <WeightChart />

        <div className="space-y-4">
          <h2 className="text-foreground text-2xl font-semibold flex items-center gap-2">
            <ScanLine className="w-7 h-7" />
            Historial de Hoy
          </h2>
          {analyses.length > 0 ? (
            <div className="space-y-3">
              {analyses.map((item) => (
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
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 flex flex-col items-center justify-center text-center space-y-2">
              <ScanLine className="w-12 h-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">No hay escaneos para hoy.</p>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <ManualFoodEntry />
        </div>

        <BmiCalculator size="small" />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-primary" />
              Consumo de Calorías
            </CardTitle>
            <CardDescription>Últimos 7 días</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-64 w-full">
              <BarChart data={chartData} margin={{ top: 20, right: 10, bottom: 5, left: -16 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} className="capitalize" />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="calories" fill="hsl(var(--primary))" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
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