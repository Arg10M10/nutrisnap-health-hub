import PageLayout from "@/components/PageLayout";
import { useNutrition } from "@/context/NutritionContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Lock, Flame, Award, Droplet, TrendingDown } from "lucide-react";
import { streakBadges, waterBadges, weightLossBadges } from "@/data/badges";

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
          <h1 className="text-primary">My Badges</h1>
          <p className="text-muted-foreground text-lg">
            Your unlocked achievements and streaks.
          </p>
        </div>

        <Card>
          <CardContent className="p-4 grid grid-cols-2 divide-x">
            <div className="flex flex-col items-center justify-center text-center gap-1 pr-4">
              <Flame className="w-10 h-10 text-orange-500" />
              <p className="text-3xl font-bold text-foreground">{streak}</p>
              <p className="text-sm text-muted-foreground">Meal Streak</p>
            </div>
            <div className="flex flex-col items-center justify-center text-center gap-1 pl-4">
              <Award className="w-10 h-10 text-yellow-500" />
              <p className="text-3xl font-bold text-foreground">{totalUnlocked}</p>
              <p className="text-sm text-muted-foreground">Total Badges</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2 text-foreground">
            <Flame className="w-6 h-6 text-orange-500" />
            Meal Streak
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
            Hydration Streak
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
              Weight Loss
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