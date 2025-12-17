import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Sun, Moon, Coffee, Apple, Ban, Scan, Utensils } from 'lucide-react';
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const { t, i18n } = useTranslation();
  const { checkLimit } = useAILimit();
  const navigate = useNavigate();
  const dateLocale = i18n.language.startsWith('es') ? es : enUS;
  
  // Calcular día actual para inicializar
  const todayIndex = new Date().getDay(); 
  const defaultIndex = todayIndex === 0 ? 6 : todayIndex - 1;
  const currentDayKeyDefault = dayKeys[defaultIndex];
  
  const [selectedDayKey, setSelectedDayKey] = useState(currentDayKeyDefault);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeMeal, setActiveMeal] = useState<MealType>('gap');

  // Generar días de la semana actual para el calendario
  const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 }); // Lunes
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
    }, 60000); // Actualizar cada minuto
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const hours = currentTime.getHours();
    // Definición de horarios
    if (hours >= 5 && hours < 11) setActiveMeal('breakfast');
    else if (hours >= 11 && hours < 16) setActiveMeal('lunch');
    else if (hours >= 16 && hours < 19) setActiveMeal('snack');
    else if (hours >= 19 && hours < 23) setActiveMeal('dinner');
    else setActiveMeal('gap'); // Late night or very early morning
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
          title: t('diets.breakfast'),
          icon: Coffee,
          color: "text-yellow-500",
          bgColor: "bg-yellow-500",
          borderColor: "border-r-yellow-500",
        };
      case 'lunch':
        return {
          title: t('diets.lunch'),
          icon: Sun,
          color: "text-orange-500",
          bgColor: "bg-orange-500",
          borderColor: "border-r-orange-500",
        };
      case 'snack':
        return {
          title: t('diets.snack'),
          icon: Apple,
          color: "text-green-500",
          bgColor: "bg-green-500",
          borderColor: "border-r-green-500",
        };
      case 'dinner':
        return {
          title: t('diets.dinner'),
          icon: Moon,
          color: "text-blue-500",
          bgColor: "bg-blue-500",
          borderColor: "border-r-blue-500",
        };
      default:
        return {
          title: "Descanso",
          icon: Ban,
          color: "text-muted-foreground",
          bgColor: "bg-muted",
          borderColor: "border-r-muted",
        };
    }
  };

  const currentMeals = plan[selectedDayKey];
  
  // Si no hay plan para este día (error raro), no renderizar nada crítico
  if (!currentMeals) return null;

  // Preparar datos de todas las comidas
  const allMealsData = [
    { type: 'breakfast', ...getMealConfig('breakfast'), content: currentMeals.breakfast },
    { type: 'lunch', ...getMealConfig('lunch'), content: currentMeals.lunch },
    { type: 'snack', ...getMealConfig('snack'), content: currentMeals.snack },
    { type: 'dinner', ...getMealConfig('dinner'), content: currentMeals.dinner },
  ] as const;

  // Encontrar la comida activa para mostrarla en la tarjeta grande
  // Si estamos en 'gap', mostramos el desayuno del día (o la próxima comida lógica)
  const highlightedMealType = activeMeal === 'gap' ? 'breakfast' : activeMeal;
  const highlightedMeal = allMealsData.find(m => m.type === highlightedMealType)!;
  
  // El resto de comidas para la lista inferior
  const otherMeals = allMealsData.filter(m => m.type !== highlightedMealType);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
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
              <AlertDialogDescription>
                {t('diets.regenerate_dialog_desc')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleRegenerateClick}>
                {t('diets.regenerate_confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Calendar Strip */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {weekDays.map((day) => {
          const isSelected = selectedDayKey === day.key;
          return (
            <button
              key={day.key}
              onClick={() => setSelectedDayKey(day.key)}
              className={cn(
                "flex flex-col items-center justify-center min-w-[3.5rem] h-16 rounded-2xl shadow-sm border transition-all shrink-0",
                isSelected 
                  ? "bg-primary text-primary-foreground border-primary scale-105" 
                  : "bg-card text-foreground border-border hover:border-primary/50"
              )}
            >
              <span className={cn("text-xs font-medium uppercase", isSelected ? "opacity-90" : "opacity-60")}>
                {day.dayName}
              </span>
              <span className="text-xl font-bold leading-none mt-0.5">
                {day.dayNumber}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Meal Card (Highlighted) */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="overflow-hidden border-none shadow-lg bg-card relative">
          {/* Background decorative blob */}
          <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 -mr-10 -mt-10 pointer-events-none", highlightedMeal.bgColor)} />
          
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={cn("p-2.5 rounded-full bg-background shadow-sm border", highlightedMeal.color)}>
                  <highlightedMeal.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{highlightedMeal.title}</h3>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-foreground tracking-tight">
                  {format(currentTime, 'h:mm')}
                </p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  {activeMeal === 'gap' ? 'Next Meal' : 'Now'}
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-lg text-muted-foreground leading-relaxed">
                {highlightedMeal.content}
              </p>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={() => navigate('/scanner')} 
                className="rounded-full px-6 shadow-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                <Scan className="w-4 h-4 mr-2" />
                {t('diets.scan_food_button')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Divider */}
      <div className="h-px bg-border w-full" />

      {/* Other Meals List */}
      <div className="space-y-4">
        {otherMeals.map((meal) => (
          <Card 
            key={meal.type} 
            className={cn(
              "border-l-0 border-t border-b border-l border-r-[6px] transition-all hover:shadow-md",
              meal.borderColor
            )}
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-bold text-foreground text-lg">{meal.title}</h4>
                <meal.icon className={cn("w-4 h-4 opacity-70", meal.color)} />
              </div>
              <p className="text-muted-foreground text-sm">
                {meal.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};