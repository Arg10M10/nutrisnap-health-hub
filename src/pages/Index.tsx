import { useState, useMemo } from "react";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Flame, Leaf, ScanLine, Settings } from "lucide-react";
import { useNutrition } from "@/context/NutritionContext";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import HealthScoreCard from "@/components/HealthScoreCard";
import WaterTrackerCard from "@/components/WaterTrackerCard";
import MainMacrosCard from "@/components/MainMacrosCard";
import SugarsCard from "@/components/SugarsCard";

const Index = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { getDataForDate, streak, streakDays, addWaterGlass, removeWaterGlass, isWaterUpdating } = useNutrition();
  const { intake, analyses, healthScore, waterIntake } = getDataForDate(selectedDate);

  const dailyGoals = {
    calories: 2000,
    protein: 90,
    carbs: 220,
    fats: 65,
    sugars: 30,
    water: 8,
  };

  const weeklyCalorieData = useMemo(() => {
    const data: { [key: string]: number } = {};
    for (let i = 0; i < 7; i++) {
      const day = subDays(new Date(), i);
      const dayKey = format(day, 'yyyy-MM-dd');
      const { intake } = getDataForDate(day);
      data[dayKey] = intake.calories;
    }
    return data;
  }, [getDataForDate, streakDays]);

  return (
    <PageLayout>
      <div className="space-y-6">
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-primary" />
            <h1 className="text-primary text-3xl">NutriSnap</h1>
          </div>
          <Link to="/settings">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="w-6 h-6 text-muted-foreground" />
            </Button>
          </Link>
        </header>

        <WeeklyCalendar 
          selectedDate={selectedDate} 
          onDateSelect={setSelectedDate} 
          weeklyCalorieData={weeklyCalorieData}
        />

        <Card className="p-4 flex justify-between items-center">
          <div>
            <p className="text-muted-foreground">Racha Actual</p>
            <p className="text-4xl font-bold text-foreground">{streak} {streak === 1 ? 'día' : 'días'}</p>
          </div>
          <Flame className="w-12 h-12 text-yellow-500" />
        </Card>

        <Carousel className="w-full" opts={{ align: "start" }}>
          <CarouselContent>
            <CarouselItem>
              <div className="p-1 h-[320px]">
                <MainMacrosCard intake={intake} goals={dailyGoals} />
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="p-1 h-[320px] flex flex-col gap-2">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <SugarsCard current={intake.sugars} goal={dailyGoals.sugars} />
                  <HealthScoreCard score={healthScore} />
                </div>
                <div className="flex-1">
                  <WaterTrackerCard 
                    count={waterIntake} 
                    goal={dailyGoals.water} 
                    onAdd={() => addWaterGlass(selectedDate)}
                    onRemove={() => removeWaterGlass(selectedDate)}
                    isUpdating={isWaterUpdating}
                  />
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex -left-4" />
          <CarouselNext className="hidden sm:flex -right-4" />
        </Carousel>

        <div className="space-y-4">
          <h2 className="text-foreground text-2xl font-semibold">Análisis del Día</h2>
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
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 flex flex-col items-center justify-center text-center space-y-2">
              <ScanLine className="w-12 h-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">No hay datos para este día.</p>
              <p className="text-sm text-muted-foreground">¡Usa el escáner para empezar a registrar!</p>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Index;