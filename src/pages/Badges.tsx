import PageLayout from "@/components/PageLayout";
import { useNutrition } from "@/context/NutritionContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Lock, Flame, Award, Droplet, TrendingDown } from "lucide-react";

const streakBadges = [
  { name: "Primer Día", description: "Registra tu primer día.", days: 1, image: "/badges/streak-1.png" },
  { name: "Tres Seguidos", description: "Mantén una racha de 3 días.", days: 3, image: "/badges/streak-3.png" },
  { name: "Casi una Semana", description: "Mantén una racha de 6 días.", days: 6, image: "/badges/streak-6.png" },
  { name: "Doble Dígito", description: "Alcanza una racha de 10 días.", days: 10, image: "/badges/streak-10.png" },
  { name: "Un Mes de Racha", description: "¡Un mes completo! Sigue así.", days: 30, image: "/badges/streak-30.png" },
  { name: "Dos Meses", description: "¡Dos meses de racha!", days: 60, image: "/badges/streak-60.png" },
  { name: "Fuego Ardiente", description: "Una racha de 80 días.", days: 80, image: "/badges/streak-80.png" },
  { name: "Club de los 100", description: "¡100 días seguidos!", days: 100, image: "/badges/streak-100.png" },
  { name: "Imparable", description: "Una racha épica de 200 días.", days: 200, image: "/badges/streak-200.png" },
  { name: "Constancia Pura", description: "Increíble racha de 300 días.", days: 300, image: "/badges/streak-300.png" },
  { name: "Leyenda", description: "Una racha imparable de 400 días.", days: 400, image: "/badges/streak-400.png" },
  { name: "Más Allá", description: "Superaste los 500 días. ¡Wow!", days: 500, image: "/badges/streak-500.png" },
];

const waterBadges = [
  { name: "Primer Vaso", description: "Registra agua por 1 día.", days: 1, image: "/badges/water-1.png" },
  { name: "Hidratación Constante", description: "Racha de agua de 3 días.", days: 3, image: "/badges/water-3.png" },
  { name: "Hábito Saludable", description: "Racha de agua de 5 días.", days: 5, image: "/badges/water-5.png" },
  { name: "Maestro del Agua", description: "Racha de agua de 10 días.", days: 10, image: "/badges/water-10.png" },
];

const weightLossBadges = [
  { name: "Primer Kilo", description: "Pierde tu primer kilo.", kg: 1, image: "/badges/weight-loss-1kg.png" },
  { name: "Meta 15kg", description: "Alcanza 15kg perdidos.", kg: 15, image: "/badges/weight-loss-15kg.png" },
  { name: "Meta 30kg", description: "Lograste perder 30kg.", kg: 30, image: "/badges/weight-loss-30kg.png" },
  { name: "Meta 50kg", description: "¡Increíble! 50kg menos.", kg: 50, image: "/badges/weight-loss-50kg.png" },
  { name: "Meta 70kg", description: "Un logro monumental: 70kg.", kg: 70, image: "/badges/weight-loss-70kg.png" },
];

const Badges = () => {
  const { streak, waterStreak } = useNutrition();
  const { profile } = useAuth();

  const weightLost = profile?.starting_weight && profile.weight ? profile.starting_weight - profile.weight : 0;

  const unlockedStreakBadgesCount = streakBadges.filter(badge => streak >= badge.days).length;
  const unlockedWaterBadgesCount = waterBadges.filter(badge => waterStreak >= badge.days).length;
  const unlockedWeightBadgesCount = weightLossBadges.filter(badge => weightLost >= badge.kg).length;
  
  const totalUnlocked = unlockedStreakBadgesCount + unlockedWaterBadgesCount + (profile?.goal === 'lose_weight' ? unlockedWeightBadgesCount : 0);

  return (
    <PageLayout>
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-primary">Mis Insignias</h1>
          <p className="text-muted-foreground text-lg">
            Tus logros y rachas desbloqueadas.
          </p>
        </div>

        <Card>
          <CardContent className="p-4 grid grid-cols-2 divide-x">
            <div className="flex flex-col items-center justify-center text-center gap-1 pr-4">
              <Flame className="w-10 h-10 text-orange-500" />
              <p className="text-3xl font-bold text-foreground">{streak}</p>
              <p className="text-sm text-muted-foreground">Racha de Comidas</p>
            </div>
            <div className="flex flex-col items-center justify-center text-center gap-1 pl-4">
              <Award className="w-10 h-10 text-yellow-500" />
              <p className="text-3xl font-bold text-foreground">{totalUnlocked}</p>
              <p className="text-sm text-muted-foreground">Insignias Totales</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2 text-foreground">
            <Flame className="w-6 h-6 text-orange-500" />
            Racha de Comidas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {streakBadges.map((badge) => {
              const isUnlocked = streak >= badge.days;
              return (
                <Card key={badge.name} className={cn("text-center p-4 transition-all", !isUnlocked && "opacity-50 bg-muted")}>
                  <CardHeader className="p-2">
                    <div className="relative w-24 h-24 mx-auto">
                      <img src={badge.image} alt={badge.name} className="w-full h-full" />
                      {!isUnlocked && (
                        <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                          <Lock className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-2">
                    <CardTitle className="text-base font-semibold">{badge.name}</CardTitle>
                    <CardDescription className="text-xs">{badge.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2 text-foreground">
            <Droplet className="w-6 h-6 text-blue-500" />
            Racha de Hidratación
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {waterBadges.map((badge) => {
              const isUnlocked = waterStreak >= badge.days;
              return (
                <Card key={badge.name} className={cn("text-center p-4 transition-all", !isUnlocked && "opacity-50 bg-muted")}>
                  <CardHeader className="p-2">
                    <div className="relative w-24 h-24 mx-auto">
                      <img src={badge.image} alt={badge.name} className="w-full h-full" />
                      {!isUnlocked && (
                        <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                          <Lock className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-2">
                    <CardTitle className="text-base font-semibold">{badge.name}</CardTitle>
                    <CardDescription className="text-xs">{badge.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {profile?.goal === 'lose_weight' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2 text-foreground">
              <TrendingDown className="w-6 h-6 text-green-500" />
              Pérdida de Peso
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {weightLossBadges.map((badge) => {
                const isUnlocked = weightLost >= badge.kg;
                return (
                  <Card key={badge.name} className={cn("text-center p-4 transition-all", !isUnlocked && "opacity-50 bg-muted")}>
                    <CardHeader className="p-2">
                      <div className="relative w-24 h-24 mx-auto">
                        <img src={badge.image} alt={badge.name} className="w-full h-full" />
                        {!isUnlocked && (
                          <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                            <Lock className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-2">
                      <CardTitle className="text-base font-semibold">{badge.name}</CardTitle>
                      <CardDescription className="text-xs">{badge.description}</CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Badges;