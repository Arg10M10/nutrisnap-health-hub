import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { useNutrition } from "@/context/NutritionContext";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Lock, Flame, Award, Droplet, TrendingDown } from "lucide-react";
import { streakBadges, waterBadges, weightLossBadges } from "@/data/badges";
import BadgeDetailModal from "@/components/BadgeDetailModal";
import { UnlockedBadgeInfo } from "@/context/NutritionContext";

const Badges = () => {
  const { streak, waterStreak } = useNutrition();
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [viewingBadge, setViewingBadge] = useState<UnlockedBadgeInfo | null>(null);

  const weightLost = profile?.starting_weight && profile.weight ? profile.starting_weight - profile.weight : 0;

  const unlockedStreakBadgesCount = streakBadges.filter(badge => streak >= badge.days).length;
  const unlockedWaterBadgesCount = waterBadges.filter(badge => waterStreak >= badge.days).length;
  const unlockedWeightBadgesCount = weightLossBadges.filter(badge => weightLost >= badge.kg).length;
  
  const totalUnlocked = unlockedStreakBadgesCount + unlockedWaterBadgesCount + (profile?.goal === 'lose_weight' ? unlockedWeightBadgesCount : 0);

  const handleBadgeClick = (badge: { id: string; image: string }, isUnlocked: boolean) => {
    if (isUnlocked) {
      setViewingBadge({
        name: t(`badge_names.${badge.id}.name` as any),
        description: t(`badge_names.${badge.id}.desc` as any),
        image: badge.image,
      });
    }
  };

  return (
    <PageLayout>
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-primary">{t('badges.title')}</h1>
          <p className="text-muted-foreground text-lg">
            {t('badges.subtitle')}
          </p>
        </div>

        <Card>
          <CardContent className="p-4 grid grid-cols-2 divide-x">
            <div className="flex flex-col items-center justify-center text-center gap-1 pr-4">
              <Flame className="w-10 h-10 text-orange-500" />
              <p className="text-3xl font-bold text-foreground">{streak}</p>
              <p className="text-sm text-muted-foreground">{t('badges.meal_streak')}</p>
            </div>
            <div className="flex flex-col items-center justify-center text-center gap-1 pl-4">
              <Award className="w-10 h-10 text-yellow-500" />
              <p className="text-3xl font-bold text-foreground">{totalUnlocked}</p>
              <p className="text-sm text-muted-foreground">{t('badges.total_badges')}</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2 text-foreground">
            <Flame className="w-6 h-6 text-orange-500" />
            {t('badges.meal_streak')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {streakBadges.map((badge) => {
              const isUnlocked = streak >= badge.days;
              return (
                <button
                  key={badge.id}
                  onClick={() => handleBadgeClick(badge, isUnlocked)}
                  disabled={!isUnlocked}
                  className="text-left disabled:cursor-not-allowed"
                >
                  <Card className={cn("text-center p-4 transition-all h-full", !isUnlocked && "opacity-50 bg-muted", isUnlocked && "hover:border-primary")}>
                    <CardHeader className="p-2">
                      <div className="relative w-24 h-24 mx-auto">
                        <img src={badge.image} alt={t(`badge_names.${badge.id}.name` as any)} className="w-full h-full" />
                        {!isUnlocked && (
                          <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                            <Lock className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-2">
                      <CardTitle className="text-base font-semibold">{t(`badge_names.${badge.id}.name` as any)}</CardTitle>
                      <CardDescription className="text-xs">{t(`badge_names.${badge.id}.desc` as any)}</CardDescription>
                    </CardContent>
                  </Card>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2 text-foreground">
            <Droplet className="w-6 h-6 text-blue-500" />
            {t('badges.hydration_streak')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {waterBadges.map((badge) => {
              const isUnlocked = waterStreak >= badge.days;
              return (
                <button
                  key={badge.id}
                  onClick={() => handleBadgeClick(badge, isUnlocked)}
                  disabled={!isUnlocked}
                  className="text-left disabled:cursor-not-allowed"
                >
                  <Card className={cn("text-center p-4 transition-all h-full", !isUnlocked && "opacity-50 bg-muted", isUnlocked && "hover:border-primary")}>
                    <CardHeader className="p-2">
                      <div className="relative w-24 h-24 mx-auto">
                        <img src={badge.image} alt={t(`badge_names.${badge.id}.name` as any)} className="w-full h-full" />
                        {!isUnlocked && (
                          <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                            <Lock className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-2">
                      <CardTitle className="text-base font-semibold">{t(`badge_names.${badge.id}.name` as any)}</CardTitle>
                      <CardDescription className="text-xs">{t(`badge_names.${badge.id}.desc` as any)}</CardDescription>
                    </CardContent>
                  </Card>
                </button>
              );
            })}
          </div>
        </div>

        {profile?.goal === 'lose_weight' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2 text-foreground">
              <TrendingDown className="w-6 h-6 text-green-500" />
              {t('badges.weight_loss')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {weightLossBadges.map((badge) => {
                const isUnlocked = weightLost >= badge.kg;
                return (
                  <button
                    key={badge.id}
                    onClick={() => handleBadgeClick(badge, isUnlocked)}
                    disabled={!isUnlocked}
                    className="text-left disabled:cursor-not-allowed"
                  >
                    <Card className={cn("text-center p-4 transition-all h-full", !isUnlocked && "opacity-50 bg-muted", isUnlocked && "hover:border-primary")}>
                      <CardHeader className="p-2">
                        <div className="relative w-24 h-24 mx-auto">
                          <img src={badge.image} alt={t(`badge_names.${badge.id}.name` as any)} className="w-full h-full" />
                          {!isUnlocked && (
                            <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                              <Lock className="w-8 h-8 text-white" />
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-2">
                        <CardTitle className="text-base font-semibold">{t(`badge_names.${badge.id}.name` as any)}</CardTitle>
                        <CardDescription className="text-xs">{t(`badge_names.${badge.id}.desc` as any)}</CardDescription>
                      </CardContent>
                    </Card>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <BadgeDetailModal 
        isOpen={!!viewingBadge}
        onClose={() => setViewingBadge(null)}
        badge={viewingBadge}
      />
    </PageLayout>
  );
};

export default Badges;