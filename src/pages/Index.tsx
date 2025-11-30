import { motion } from "framer-motion";
import PageLayout from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import { Flame, Leaf, Beef, Wheat, Droplets, ScanLine } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MacroProgressCircle from "@/components/MacroProgressCircle";
import RecentAnalysisCard from "@/components/RecentAnalysisCard";
import { useNutrition } from "@/context/NutritionContext";

const Index = () => {
  const { intake, recentAnalyses } = useNutrition();

  const dailyGoals = {
    calories: 2000,
    protein: 90,
    carbs: 220,
    fats: 65,
  };

  const caloriesRemaining = dailyGoals.calories - intake.calories;
  const calorieProgress = (intake.calories / dailyGoals.calories) * 100;
  
  const proteinProgress = (intake.protein / dailyGoals.protein) * 100;
  const proteinText = intake.protein > dailyGoals.protein ? "exceso" : "restante";

  const carbsProgress = (intake.carbs / dailyGoals.carbs) * 100;
  const carbsText = intake.carbs > dailyGoals.carbs ? "exceso" : "restante";

  const fatsProgress = (intake.fats / dailyGoals.fats) * 100;
  const fatsText = intake.fats > dailyGoals.fats ? "exceso" : "restante";

  const macroCards = [
    {
      value: proteinProgress,
      color: "#ef4444",
      icon: <Beef className="w-6 h-6 text-red-500" />,
      current: intake.protein,
      label: "Proteína",
      status: proteinText,
    },
    {
      value: carbsProgress,
      color: "#f97316",
      icon: <Wheat className="w-6 h-6 text-orange-500" />,
      current: intake.carbs,
      label: "Carbs",
      status: carbsText,
    },
    {
      value: fatsProgress,
      color: "#3b82f6",
      icon: <Droplets className="w-6 h-6 text-blue-500" />,
      current: intake.fats,
      label: "Grasas",
      status: fatsText,
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
        </header>

        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="today" className="text-base">Hoy</TabsTrigger>
            <TabsTrigger value="yesterday" className="text-base">Ayer</TabsTrigger>
          </TabsList>
        </Tabs>

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
          <h2 className="text-foreground text-2xl font-semibold">Análisis Recientes</h2>
          {recentAnalyses.length > 0 ? (
            <div className="space-y-3">
              {recentAnalyses.map((item) => (
                <RecentAnalysisCard 
                  key={item.id} 
                  imageUrl={item.imageUrl}
                  foodName={item.foodName}
                  time={item.timestamp}
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
              <p className="text-muted-foreground">No has analizado nada hoy.</p>
              <p className="text-sm text-muted-foreground">¡Usa el escáner para empezar!</p>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Index;