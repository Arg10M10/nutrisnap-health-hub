import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Sun, Moon, Coffee, Apple, Ban, Scan, Flame, Beef, Wheat, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAILimit } from '@/hooks/useAILimit';
import { useTranslation } from 'react-i18next';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from '@/context/AuthContext';

type Meal = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

type MealPlan = {
  [day: string]: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snack: Meal;
  };
};

interface WeeklyPlanDisplayProps {
  plan: MealPlan;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

const dayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'gap';

const MealMacros = ({ calories, protein, carbs, fats }: { calories: number, protein: number, carbs: number, fats: number }) => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-3">
    <div className="flex items-center gap-1.5">
      <Flame className="w-4 h-4 text-primary" />
      <span className="font-medium text-foreground">{calories} kcal</span>
    </div>
    <div className="flex items-center gap-1.5">
      <Beef className="w-4 h-4 text-red-500" />
      <span className="font-medium text-foreground">{protein}g</span>
    </div>
    <div className="flex items-center gap-1.5">
      <Wheat className="w-4 h-4 text-orange-500" />
      <span className="font-medium text-foreground">{carbs}g</span>
    </div>
    <div className="flex items-center gap-1.5">
      <Droplets className="w-4 h-4 text-blue-500" />
      <span className="font-medium text-foreground">{fats}g</span>
    </div>
  </div>
);

export const WeeklyPlanDisplay = ({ plan, onRegenerate, isRegenerating }: WeeklyPlanDisplayProps) => {
  const { t, i18n } = useTranslation();
  const { checkLimit } = useAILimit();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const dateLocale = i18n.language.startsWith('es') ? es : enUS;
  
  const todayIndex = new Date().getDay(); 
  const defaultIndex = todayIndex === 0 ? 6 : todayIndex - 1;
  const currentDayKeyDefault = dayKeys[defaultIndex];
  
  const [selectedDayKey, setSelectedDayKey] = useState(currentDayKeyDefault);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeMeal, setActiveMeal] = useState<MealType>('gap');

  const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const date = addDays(startOfCurrentWeek, i);
    return {
      date,
      key: dayKeys[i],
      dayName: format(date, 'EEE', { locale: dateLocale }),
      dayNumber: format(date, 'd'),
      isToday: isSameDay(date, new Date())
    };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const hours = currentTime.getHours();
    if (hours >= 6 && hours < 10) setActiveMeal('breakfast');
    else if (hours >= 12 && hours < 15) setActiveMeal('lunch');
    else if (hours >= 16 && hours < 17) setActiveMeal('snack');
    else if (hours >= 19 && hours < 21) setActiveMeal('dinner');
    else setActiveMeal('gap');
  }, [currentTime]);

  const handleRegenerateClick = async () => {
    const { canProceed, limit } = await checkLimit('diet_plan', 1, 'weekly');
    if (canProceed) {
      onRegenerate();
    } else {
      toast.error(t('common.ai_limit_reached'), {
        description: t('common.ai_limit_weekly_desc', { limit }),
      });
    }
  };

  const getMealConfig = (type: MealType) => {
    switch (type) {
      case 'breakfast': return { title: t('diets.breakfast'), icon: Coffee, color: "text-yellow-500", bgColor: "bg-yellow-500", borderColor: "border-r-yellow-500" };
      case 'lunch': return { title: t('diets.lunch'), icon: Sun, color: "text-orange-500", bgColor: "bg-orange-500", borderColor: "border-r-orange-500" };
      case 'snack': return { title: t('diets.snack'), icon: Apple, color: "text-green-500", bgColor: "bg-green-500", borderColor: "border-r-green-500" };
      case 'dinner': return { title: t('diets.dinner'), icon: Moon, color: "text-blue-500", bgColor: "bg-blue-500", borderColor: "border-r-blue-500" };
      default: return { title: t('diets.gap_title'), icon: Ban, color: "text-muted-foreground", bgColor: "bg-muted", borderColor: "border-r-muted" };
    }
  };

  const currentMeals = plan[selectedDayKey];
  if (!currentMeals) return null;

  const allMealsData = [
    { type: 'breakfast', ...getMealConfig('breakfast'), content: currentMeals.breakfast },
    { type: 'lunch', ...getMealConfig('lunch'), content: currentMeals.lunch },
    { type: 'snack', ...getMealConfig('snack'), content: currentMeals.snack },
    { type: 'dinner', ...getMealConfig('dinner'), content: currentMeals.dinner },
  ] as const;

  let highlightedMeal;
  let otherMeals;

  if (activeMeal === 'gap') {
    highlightedMeal = { type: 'gap', ...getMealConfig('gap'), content: t('diets.gap_time_message') };
    otherMeals = allMealsData;
  } else {
    highlightedMeal = allMealsData.find(m => m.type === activeMeal)!;
    otherMeals = allMealsData.filter(m => m.type !== activeMeal);
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-start px-1">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t('diets.weekly_plan_title')}</h2>
          <p className="text-sm text-muted-foreground">{t('diets.weekly_plan_subtitle')}</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isRegenerating} title={t('diets.regenerate_tooltip')}>
              <RefreshCw className={cn("w-5 h-5 text-muted-foreground", isRegenerating && "animate-spin")} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('diets.regenerate_dialog_title')}</AlertDialogTitle>
              <AlertDialogDescription>{t('diets.regenerate_dialog_desc')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleRegenerateClick}>{t('diets.regenerate_confirm')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {weekDays.map((day) => (
          <button
            key={day.key}
            onClick={() => setSelectedDayKey(day.key)}
            className={cn(
              "flex flex-col items-center justify-center min-w-[3.5rem] h-16 rounded-2xl shadow-sm border transition-all shrink-0",
              selectedDayKey === day.key ? "bg-primary text-primary-foreground border-primary scale-105" : "bg-card text-foreground border-border hover:border-primary/50"
            )}
          >
            <span className={cn("text-xs font-medium uppercase", selectedDayKey === day.key ? "opacity-90" : "opacity-60")}>{day.dayName}</span>
            <span className="text-xl font-bold leading-none mt-0.5">{day.dayNumber}</span>
          </button>
        ))}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="overflow-hidden border-none shadow-lg bg-card relative">
          <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 -mr-10 -mt-10 pointer-events-none", highlightedMeal.bgColor)} />
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={cn("p-2.5 rounded-full bg-background shadow-sm border", highlightedMeal.color)}><highlightedMeal.icon className="w-6 h-6" /></div>
                <h3 className="text-xl font-bold text-foreground">{highlightedMeal.title}</h3>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-foreground tracking-tight">{format(currentTime, profile?.time_format === '24h' ? 'HH:mm' : 'h:mm')}</p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  {activeMeal === 'gap' ? t('diets.gap_title') : t('diets.active_diet')}
                </p>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-lg text-muted-foreground leading-relaxed">
                {typeof highlightedMeal.content === 'object' ? highlightedMeal.content.name : highlightedMeal.content}
              </p>
              {typeof highlightedMeal.content === 'object' && (
                <MealMacros {...highlightedMeal.content} />
              )}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => navigate('/scanner')} className="rounded-full px-6 shadow-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                <Scan className="w-4 h-4 mr-2" />{t('diets.scan_food_button')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="h-px bg-border w-full" />

      <div className="space-y-4">
        {otherMeals.map((meal) => (
          <Card key={meal.type} className={cn("border-l-0 border-t border-b border-l border-r-[6px] transition-all hover:shadow-md", meal.borderColor)}>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-bold text-foreground text-lg">{meal.title}</h4>
                <meal.icon className={cn("w-4 h-4 opacity-70", meal.color)} />
              </div>
              <p className="text-muted-foreground text-sm">{meal.content.name}</p>
              <MealMacros {...meal.content} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};