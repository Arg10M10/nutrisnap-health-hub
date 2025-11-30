import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Leaf, Beef, Wheat, Droplets } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MacroProgressCircle from "@/components/MacroProgressCircle";
import RecentAnalysisCard from "@/components/RecentAnalysisCard";

const Index = () => {
  // Define daily goals (can be moved to a context or user profile later)
  const dailyGoals = {
    calories: 2000,
    protein: 90,
    carbs: 220,
    fats: 65,
  };

  // State for current intake, starting at 0
  const [currentIntake, setCurrentIntake] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });

  const recentItems = [
    {
      imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop",
      foodName: "Ensalada Fresca",
      time: "12:57pm",
      calories: 253,
      protein: 12,
      carbs: 10,
      fats: 15,
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1981&auto=format&fit=crop",
      foodName: "Pizza de Pepperoni",
      time: "11:31am",
      calories: 455,
      protein: 20,
      carbs: 45,
      fats: 22,
    },
  ];

  // Calculations
  const caloriesRemaining = dailyGoals.calories - currentIntake.calories;
  const calorieProgress = (currentIntake.calories / dailyGoals.calories) * 100;
  
  const proteinProgress = (currentIntake.protein / dailyGoals.protein) * 100;
  const proteinText = currentIntake.protein > dailyGoals.protein ? "exceso" : "restante";

  const carbsProgress = (currentIntake.carbs / dailyGoals.carbs) * 100;
  const carbsText = currentIntake.carbs > dailyGoals.carbs ? "exceso" : "restante";

  const fatsProgress = (currentIntake.fats / dailyGoals.fats) * 100;
  const fatsText = currentIntake.fats > dailyGoals.fats ? "exceso" : "restante";

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-primary" />
            <h1 className="text-primary text-3xl">NutriSnap</h1>
          </div>
          <Button variant="ghost" size="icon">
            <Flame className="w-6 h-6 text-muted-foreground" />
          </Button>
        </header>

        {/* Date Tabs */}
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="today" className="text-base">Hoy</TabsTrigger>
            <TabsTrigger value="yesterday" className="text-base">Ayer</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Main Calorie Card */}
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

        {/* Macronutrient Cards */}
        <div className="grid grid-cols-3 gap-4">
          {/* Protein */}
          <Card className="p-4 text-center space-y-2">
            <div className="w-16 h-16 mx-auto relative">
              <MacroProgressCircle value={proteinProgress} color="#ef4444" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Beef className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <p className="text-xl font-bold text-foreground">{currentIntake.protein}g</p>
            <p className="text-sm text-muted-foreground">Proteína ({proteinText})</p>
          </Card>
          {/* Carbs */}
          <Card className="p-4 text-center space-y-2">
            <div className="w-16 h-16 mx-auto relative">
              <MacroProgressCircle value={carbsProgress} color="#f97316" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Wheat className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <p className="text-xl font-bold text-foreground">{currentIntake.carbs}g</p>
            <p className="text-sm text-muted-foreground">Carbs ({carbsText})</p>
          </Card>
          {/* Fats */}
          <Card className="p-4 text-center space-y-2">
            <div className="w-16 h-16 mx-auto relative">
              <MacroProgressCircle value={fatsProgress} color="#3b82f6" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Droplets className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <p className="text-xl font-bold text-foreground">{currentIntake.fats}g</p>
            <p className="text-sm text-muted-foreground">Grasas ({fatsText})</p>
          </Card>
        </div>

        {/* Recent Analysis */}
        <div className="space-y-4">
          <h2 className="text-foreground text-2xl font-semibold">Análisis Recientes</h2>
          <div className="space-y-3">
            {recentItems.map((item, index) => (
              <RecentAnalysisCard key={index} {...item} />
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Index;