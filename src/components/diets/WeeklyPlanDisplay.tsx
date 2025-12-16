import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Sun, Moon, Coffee, Apple, Ban } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { useAILimit } from '@/hooks/useAILimit';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'gap';

export const WeeklyPlanDisplay = ({ plan, onRegenerate, isRegenerating }: WeeklyPlanDisplayProps) => {
  const { t } = useTranslation();
  const { checkLimit } = useAILimit();
  const todayIndex = new Date().getDay(); 
  const defaultIndex = todayIndex === 0 ? 6 : todayIndex - 1;
  const currentDayKey = dayKeys[defaultIndex];
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeMeal, setActiveMeal] = useState<MealType>('gap');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const hours = currentTime.getHours();
    // 5AM-11AM desayuno
    // 11AM-3PM comida (15:00)
    // 5PM-6PM snack (17:00 - 18:00)
    // 7PM-10PM cena (19:00 - 22:00)
    
    if (hours >= 5 && hours < 11) {
      setActiveMeal('breakfast');
    } else if (hours >= 11 && hours < 15) {
      setActiveMeal('lunch');
    } else if (hours >= 17 && hours < 18) {
      setActiveMeal('snack');
    } else if (hours >= 19 && hours < 22) {
      setActiveMeal('dinner');
    } else {
      setActiveMeal('gap');
    }
  }, [currentTime]);

  const handleRegenerateClick = async () => {
    const canProceed = await checkLimit('diet_plan', 1, 'weekly');
    if (canProceed) {
      onRegenerate();
    }
  };

  const getMealConfig = (type: MealType) => {
    switch (type) {
      case 'breakfast':
        return {
          label: t('diets.breakfast'),
          message: "¡Hora del desayuno!",
          icon: Coffee,
          color: "text-yellow-500",
          borderColor: "border-l-yellow-500",
        };
      case 'lunch':
        return {
          label: t('diets.lunch'),
          message: "¡Hora de la comida!",
          icon: Sun,
          color: "text-orange-500",
          borderColor: "border-l-orange-500",
        };
      case 'snack':
        return {
          label: t('diets.snack'),
          message: "¡Hora del snack!",
          icon: Apple,
          color: "text-green-500",
          borderColor: "border-l-green-500",
        };
      case 'dinner':
        return {
          label: t('diets.dinner'),
          message: "¡Hora de la cena!",
          icon: Moon,
          color: "text-blue-500",
          borderColor: "border-l-blue-500",
        };
      default:
        return {
          label: "",
          message: "No es hora de comer",
          icon: Ban,
          color: "text-muted-foreground",
          borderColor: "border-l-muted",
        };
    }
  };

  const currentConfig = getMealConfig(activeMeal);

  // Define cards structure to allow sorting
  const getCards = (meals: any) => [
    {
      id: 'breakfast',
      type: 'breakfast' as MealType,
      title: t('diets.breakfast'),
      icon: Coffee,
      content: meals.breakfast,
      borderColor: 'border-l-yellow-400',
      iconColor: 'text-yellow-500'
    },
    {
      id: 'lunch',
      type: 'lunch' as MealType,
      title: t('diets.lunch'),
      icon: Sun,
      content: meals.lunch,
      borderColor: 'border-l-orange-400',
      iconColor: 'text-orange-500'
    },
    {
      id: 'snack',
      type: 'snack' as MealType,
      title: t('diets.snack'),
      icon: Apple,
      content: meals.snack,
      borderColor: 'border-l-green-400',
      iconColor: 'text-green-500'
    },
    {
      id: 'dinner',
      type: 'dinner' as MealType,
      title: t('diets.dinner'),
      icon: Moon,
      content: meals.dinner,
      borderColor: 'border-l-blue-400',
      iconColor: 'text-blue-500'
    }
  ];

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

        {/* Dynamic Meal Card (Unified Style) */}
        <Card className={cn(
          "mt-6 shadow-lg border-l-[10px] transition-all duration-500",
          currentConfig.borderColor
        )}>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className={cn("text-5xl font-bold mb-3 tracking-tight", currentConfig.color)}>
              {format(currentTime, 'h:mm a', { locale: es }).toUpperCase()}
            </div>
            <div className={cn("flex items-center justify-center gap-3", currentConfig.color)}>
              <currentConfig.icon className="w-7 h-7" />
              <h3 className="text-2xl font-bold leading-tight">{currentConfig.message}</h3>
            </div>
          </CardContent>
        </Card>

        {dayKeys.map((dayKey) => {
          const meals = plan[dayKey];
          if (!meals) return null;

          // Reorder logic: Current active meal goes first
          const allCards = getCards(meals);
          const sortedCards = [...allCards].sort((a, b) => {
            if (a.type === activeMeal) return -1;
            if (b.type === activeMeal) return 1;
            return 0;
          });

          return (
            <TabsContent key={dayKey} value={dayKey} className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid gap-4">
                {sortedCards.map((card) => (
                  <Card key={card.id} className={cn("border-l-4 transition-all duration-300", card.borderColor, card.type === activeMeal && "shadow-md scale-[1.01] border-l-[6px]")}>
                    <CardHeader className="pb-2 pt-4 px-4">
                      <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                        <card.icon className={cn("w-5 h-5", card.iconColor)} />
                        {card.title}
                        {card.type === activeMeal && (
                          <span className={cn("ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-background border shadow-sm", card.iconColor)}>
                            Ahora
                          </span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <p className="text-muted-foreground">{card.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};