import PageLayout from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Leaf, Flame, Beef, Wheat, Droplets } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MacroProgressCircle from "@/components/MacroProgressCircle";
import RecentAnalysisCard from "@/components/RecentAnalysisCard";

const Index = () => {
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
            <Bell className="w-6 h-6 text-muted-foreground" />
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
            <p className="text-5xl font-bold text-foreground">1250</p>
          </div>
          <div className="w-24 h-24 relative">
            <MacroProgressCircle value={60} color="hsl(var(--primary))" size="large" />
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
              <MacroProgressCircle value={110} color="#ef4444" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Beef className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <p className="text-xl font-bold text-foreground">45g</p>
            <p className="text-sm text-muted-foreground">Proteína (exceso)</p>
          </Card>
          {/* Carbs */}
          <Card className="p-4 text-center space-y-2">
            <div className="w-16 h-16 mx-auto relative">
              <MacroProgressCircle value={40} color="#f97316" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Wheat className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <p className="text-xl font-bold text-foreground">89g</p>
            <p className="text-sm text-muted-foreground">Carbs (restante)</p>
          </Card>
          {/* Fats */}
          <Card className="p-4 text-center space-y-2">
            <div className="w-16 h-16 mx-auto relative">
              <MacroProgressCircle value={75} color="#3b82f6" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Droplets className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <p className="text-xl font-bold text-foreground">48g</p>
            <p className="text-sm text-muted-foreground">Grasas (restante)</p>
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