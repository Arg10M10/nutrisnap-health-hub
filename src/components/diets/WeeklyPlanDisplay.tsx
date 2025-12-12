import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Sun, Moon, Coffee, Apple } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { useAILimit } from '@/hooks/useAILimit';
import { useTranslation } from 'react-i18next';

type MealPlan = {
  [day: string]: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snack: string;
  };
};

interface WeeklyPlanDisplayProps {
  plan: MealPlan;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

const dayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export const WeeklyPlanDisplay = ({ plan, onRegenerate, isRegenerating }: WeeklyPlanDisplayProps) => {
  const { t } = useTranslation();
  const { checkLimit } = useAILimit();
  const todayIndex = new Date().getDay(); 
  const defaultIndex = todayIndex === 0 ? 6 : todayIndex - 1;
  const currentDayKey = dayKeys[defaultIndex];

  const handleRegenerateClick = async () => {
    const canProceed = await checkLimit('diet_plan', 1, 'weekly');
    if (canProceed) {
      onRegenerate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-2xl font-bold text-primary">{t('diets.weekly_plan_title')}</h2>
          <p className="text-sm text-muted-foreground">{t('diets.weekly_plan_subtitle')}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={handleRegenerateClick} disabled={isRegenerating} title={t('diets.regenerate_tooltip')}>
          <RefreshCw className={cn("w-5 h-5 text-muted-foreground", isRegenerating && "animate-spin")} />
        </Button>
      </div>

      <Tabs defaultValue={currentDayKey} className="w-full">
        <div className="overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="h-12 w-full justify-start gap-2 bg-transparent p-0">
            {dayKeys.map((dayKey) => (
              <TabsTrigger 
                key={dayKey} 
                value={dayKey}
                className="h-10 rounded-full px-4 border border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary hover:bg-muted"
              >
                {t(`diets.days_short.${dayKey}` as any)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {dayKeys.map((dayKey) => {
          const meals = plan[dayKey];
          if (!meals) return null;

          return (
            <TabsContent key={dayKey} value={dayKey} className="mt-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid gap-4">
                {/* Breakfast */}
                <Card className="border-l-4 border-l-yellow-400">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                      <Coffee className="w-5 h-5 text-yellow-500" />
                      {t('diets.breakfast')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <p className="text-muted-foreground">{meals.breakfast}</p>
                  </CardContent>
                </Card>

                {/* Lunch */}
                <Card className="border-l-4 border-l-orange-400">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                      <Sun className="w-5 h-5 text-orange-500" />
                      {t('diets.lunch')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <p className="text-muted-foreground">{meals.lunch}</p>
                  </CardContent>
                </Card>

                {/* Snack */}
                <Card className="border-l-4 border-l-green-400">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                      <Apple className="w-5 h-5 text-green-500" />
                      {t('diets.snack')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <p className="text-muted-foreground">{meals.snack}</p>
                  </CardContent>
                </Card>

                {/* Dinner */}
                <Card className="border-l-4 border-l-indigo-400">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                      <Moon className="w-5 h-5 text-indigo-500" />
                      {t('diets.dinner')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <p className="text-muted-foreground">{meals.dinner}</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};