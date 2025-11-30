import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Leaf, Beef, Wheat, Droplets, ScanLine, Settings } from "lucide-react";
import MacroProgressCircle from "@/components/MacroProgressCircle";
import RecentAnalysisCard from "@/components/RecentAnalysisCard";
import { useNutrition } from "@/context/NutritionContext";
import WeeklyCalendar from "@/components/WeeklyCalendar";

const Index = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { getDataForDate } = useNutrition();
  const { intake, analyses } = getDataForDate(selectedDate);

  const dailyGoals = {
    calories: 2000,
    protein: 90,
    carbs: 220,
    fats: 65,
  };

  const caloriesRemaining = dailyGoals.calories - intake.calories;
  const calorieProgress = (intake.calories / dailyGoals.calories) * 100;
  
  const proteinProgress = (intake.protein / dailyGoals.protein) * 100;
  const carbsProgress = (intake.carbs / dailyGoals.carbs) * 100;
  const fatsProgress = (intake.fats / dailyGoals.fats) * 100;

  const macroCards = [
    {
      value: proteinProgress,
      color: "#ef4444",
      icon: <Beef className="w-6 h-6 text-red-500" />,
      current: intake.protein,
      label: "Proteína",
    },
    {
      value: carbsProgress,
      color: "#f97316",
      icon: <Wheat className="w-6 h-6 text-orange-500" />,
      current: intake.carbs,
      label: "Carbs",
    },
    {
      value: fatsProgress,
      color: "#3b82f6",
      icon: <Droplets className="w-6 h-6 text-blue-500" />,
      current: intake.fats,
      label: "Grasas",
    },
  ];

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

        <WeeklyCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />

        <Card className="p-6 flex justify-between items-center bg-gradient-to-br from-primary/10 to-secondary/10">
          <div>
            <p className="text-muted-foreground text-lg">Calorías restantes</p>
            <p className="text-5xl font-bold text-foreground">{caloriesRemaining}</p>
          </div>
          <div className="w-24 h-24 relative">
            <MacroProgressCircle value={calorieProgress} color="hsl(var(--primary))" size="large" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Flame className="w-8 h-8 text-primary" />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-4">
          {macroCards.map((macro, index) => (
            <motion.div key={index} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Card className="p-4 text-center space-y-2 h-full">
                <div className="w-16 h-16 mx-auto relative">
                  <MacroProgressCircle value={macro.value} color={macro.color} />
                  <div className="absolute inset-0 flex items-center justify-center">{macro.icon}</div>
                </div>
                <p className="text-xl font-bold text-foreground">{macro.current}g</p>
                <p className="text-sm text-muted-foreground">{macro.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-foreground text-2xl font-semibold">Análisis del Día</h2>
          {analyses.length > 0 ? (
            <div className="space-y-3">
              {analyses.map((item) => (
                <RecentAnalysisCard 
                  key={item.id} 
                  imageUrl={item.imageUrl}
                  foodName={item.foodName}
                  time={format(new Date(item.timestamp), 'p', { locale: es })}
                  calories={item.caloriesValue}
                  protein={item.proteinValue}
                  carbs={item.carbsValue}
                  fats={item.fatsValue}
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