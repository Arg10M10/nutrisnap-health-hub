import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Droplets, Flame, ScanLine } from "lucide-react";
import RecentAnalysisCard from "@/components/RecentAnalysisCard";

// Mock data for demonstration
const weeklyCaloriesData = [
  { day: "Lun", calories: 1800 },
  { day: "Mar", calories: 2100 },
  { day: "Mié", calories: 1950 },
  { day: "Jue", calories: 2200 },
  { day: "Vie", calories: 2300 },
  { day: "Sáb", calories: 2500 },
  { day: "Dom", calories: 2150 },
];

const recentScans = [
    { imageUrl: "/placeholder.svg", foodName: "Ensalada César", time: "Ayer, 1:15 PM", calories: 450, protein: 30, carbs: 15, fats: 25 },
    { imageUrl: "/placeholder.svg", foodName: "Manzana", time: "Ayer, 9:30 AM", calories: 95, protein: 1, carbs: 25, fats: 0 },
    { imageUrl: "/placeholder.svg", foodName: "Salmón a la parrilla", time: "Hace 2 días", calories: 550, protein: 40, carbs: 5, fats: 40 },
];

const Progress = () => {
  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-primary">Tu Progreso</h1>
          <p className="text-muted-foreground text-lg">
            Visualiza tus hábitos y avances a lo largo del tiempo.
          </p>
        </div>

        <Tabs defaultValue="week">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="week">Semana</TabsTrigger>
            <TabsTrigger value="month">Mes</TabsTrigger>
          </TabsList>
          <TabsContent value="week" className="mt-6 space-y-6">
            {/* Calorie Chart */}
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
                  <BarChart data={weeklyCaloriesData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Bar dataKey="calories" fill="hsl(var(--primary))" radius={8} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Water Intake */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="w-6 h-6 text-blue-500" />
                  Hidratación
                </CardTitle>
                <CardDescription>Tu meta diaria es 8 vasos.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center gap-4 text-4xl py-6">
                <span>💧</span><span>💧</span><span>💧</span><span>💧</span>
                <span className="opacity-30">💧</span><span className="opacity-30">💧</span>
                <span className="opacity-30">💧</span><span className="opacity-30">💧</span>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="month" className="mt-6">
             <div className="text-center py-10">
                <p className="text-muted-foreground">La vista mensual estará disponible pronto.</p>
              </div>
          </TabsContent>
        </Tabs>

        {/* Recent Scans */}
        <div className="space-y-4">
          <h2 className="text-foreground text-2xl font-semibold flex items-center gap-2">
            <ScanLine className="w-7 h-7" />
            Historial de Escaneos
          </h2>
          {recentScans.length > 0 ? (
            <div className="space-y-3">
              {recentScans.map((item, index) => (
                <RecentAnalysisCard key={index} {...item} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No hay escaneos recientes.</p>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Progress;