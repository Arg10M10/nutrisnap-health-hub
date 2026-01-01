import { useState, useMemo, useEffect } from "react";
import { format, subDays, addWeeks } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import PageLayout from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { Flame, Leaf, Plus, Beef, Wheat, Droplets, Sparkles, Utensils, ChevronDown, ChevronUp } from "lucide-react";
import { useNutrition, FoodEntry, ExerciseEntry } from "@/context/NutritionContext";
import { useAuth } from "@/context/AuthContext";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import HealthScoreCard from "@/components/HealthScoreCard";
import WaterTrackerCard from "@/components/WaterTrackerCard";
import MacroCard from "@/components/MacroCard";
import CaloriesCard from "@/components/CaloriesCard";
import RecentAnalysisCard from "@/components/RecentAnalysisCard";
import RecentExerciseCard from "@/components/RecentExerciseCard";
import AnimatedNumber from "@/components/AnimatedNumber";
import AnalysisDetailDrawer from "@/components/AnalysisDetailDrawer";
import AppTutorial from "@/components/AppTutorial";
import ManualFoodEntry from "@/components/ManualFoodEntry";
import { cn } from "@/lib/utils";
import StreakModal from "@/components/StreakModal";
import SwipeToDelete from "@/components/SwipeToDelete";
import MenuAnalysisDrawer, { MenuAnalysisData } from "@/components/MenuAnalysisDrawer";

const Index = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { getDataForDate, streak, streakDays, addWaterGlass, removeWaterGlass, isWaterUpdating, deleteEntry } = useNutrition();
  const { profile } = useAuth();
  const { intake, analyses, healthScore, waterIntake } = getDataForDate(selectedDate);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const { t, i18n } = useTranslation();
  
  // Estado para detalles de comida normal
  const [selectedAnalysis, setSelectedAnalysis] = useState<FoodEntry | null>(null);
  // Estado para detalles de menú
  const [selectedMenuData, setSelectedMenuData] = useState<MenuAnalysisData | null>(null);
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);

  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.fromGeneratingPlan && profile) {
      if (profile.goal !== 'maintain_weight' && profile.weight && profile.goal_weight && profile.weekly_rate && profile.weekly_rate > 0) {
        const weightDifference = Math.abs(profile.weight - profile.goal_weight);
        const weeksNeeded = weightDifference / profile.weekly_rate;
        const targetDate = addWeeks(new Date(), weeksNeeded);
        
        const locale = i18n.language.startsWith('es') ? es : enUS;
        const formattedDate = format(targetDate, 'd \'de\' MMMM \'de\' yyyy', { locale });

        toast.success(t('home.goal_achieved_toast', { date: formattedDate }));
      }
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, profile, navigate, t, i18n.language]);

  useEffect(() => {
    if (!api) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const dailyGoals = {
    calories: profile?.goal_calories || 2000,
    protein: profile?.goal_protein || 90,
    carbs: profile?.goal_carbs || 220,
    fats: profile?.goal_fats || 65,
    water: 64, // Meta actualizada a 64 onzas
    sugars: profile?.goal_sugars || 25,
  };

  const getSafePercentage = (current?: number | null, goal?: number | null) => {
    const currentVal = current || 0;
    const goalVal = goal || 0;
    if (goalVal === 0) return 0;
    const percentage = (currentVal / goalVal) * 100;
    return isNaN(percentage) ? 0 : percentage;
  };

  const weeklyCalorieData = useMemo(() => {
    const data: { [key: string]: number } = {};
    for (let i = 0; i < 7; i++) {
      const day = subDays(new Date(), i);
      const dayKey = format(day, 'yyyy-MM-dd');
      const { intake } = getDataForDate(day);
      data[dayKey] = intake.calories;
    }
    return data;
  }, [getDataForDate, streakDays]);

  const cardVariants: Variants = {
    active: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    inactive: { opacity: 0.6, scale: 0.95, transition: { duration: 0.3, ease: "easeOut" } },
  };

  // Función helper para determinar si es un análisis de menú
  const isMenuAnalysis = (data: any): boolean => {
    return data && typeof data === 'object' && Array.isArray(data.recommended);
  };

  const handleEntryClick = (item: FoodEntry) => {
    if (item.analysis_data && isMenuAnalysis(item.analysis_data)) {
      setSelectedMenuData(item.analysis_data);
      setIsMenuDrawerOpen(true);
    } else {
      setSelectedAnalysis(item);
    }
  };

  return (
    <PageLayout>
      <AppTutorial />
      <div className="space-y-6">
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-primary" />
            <h1 className="text-primary text-3xl">{t('home.title')}</h1>
          </div>
          <button 
            onClick={() => setIsStreakModalOpen(true)}
            className="flex items-center gap-2 bg-background border text-foreground px-3 py-1.5 rounded-full shadow-md transition-transform active:scale-95 hover:bg-muted/50"
          >
            <Flame className="w-5 h-5 text-orange-400 fill-current" />
            <span className="font-bold text-sm">
              <AnimatedNumber value={streak} />
            </span>
          </button>
        </header>

        <WeeklyCalendar 
          selectedDate={selectedDate} 
          onDateSelect={setSelectedDate} 
          weeklyCalorieData={weeklyCalorieData}
          calorieGoal={dailyGoals.calories}
        />

        <div id="daily-summary-carousel">
          <Carousel className="w-full" opts={{ align: "start", duration: 20 }} setApi={setApi}>
            <CarouselContent>
              <CarouselItem className="pt-1 pb-1">
                <motion.div variants={cardVariants} animate={current === 0 ? "active" : "inactive"}>
                  <div className="flex flex-col gap-3 h-[330px]">
                    <div className="flex-1 w-full min-h-0">
                      <CaloriesCard current={intake.calories} goal={dailyGoals.calories} className="h-full" />
                    </div>
                    <div className="h-[160px] w-full flex-shrink-0">
                      <div className="grid grid-cols-3 gap-2 w-full h-full">
                        <MacroCard
                          value={getSafePercentage(intake.protein, dailyGoals.protein)}
                          color="#ef4444"
                          icon={<Beef className="w-5 h-5 text-red-500" />}
                          current={intake.protein}
                          unit="g"
                          label={t('home.protein')}
                        />
                        <MacroCard
                          value={getSafePercentage(intake.carbs, dailyGoals.carbs)}
                          color="#f97316"
                          icon={<Wheat className="w-5 h-5 text-orange-500" />}
                          current={intake.carbs}
                          unit="g"
                          label={t('home.carbs')}
                        />
                        <MacroCard
                          value={getSafePercentage(intake.fats, dailyGoals.fats)}
                          color="#3b82f6"
                          icon={<Droplets className="w-5 h-5 text-blue-500" />}
                          current={intake.fats}
                          unit="g"
                          label={t('home.fats')}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </CarouselItem>

              <CarouselItem className="pt-1 pb-1">
                <motion.div variants={cardVariants} animate={current === 1 ? "active" : "inactive"}>
                  <div className="flex flex-col gap-3 h-[330px]">
                    <div className="flex-1 w-full min-h-0">
                      <div className="grid grid-cols-2 gap-2 w-full h-full">
                        <HealthScoreCard score={healthScore} />
                        <WaterTrackerCard
                          count={waterIntake}
                          goal={dailyGoals.water}
                          onAdd={(amount) => addWaterGlass(selectedDate, amount)}
                          onRemove={() => removeWaterGlass(selectedDate)}
                          isUpdating={isWaterUpdating}
                        />
                      </div>
                    </div>
                    <div className="h-[160px] w-full flex-shrink-0">
                      <MacroCard
                          value={getSafePercentage(intake.sugars, dailyGoals.sugars)}
                          color="#a855f7"
                          icon={<Sparkles className="w-5 h-5 text-purple-500" />}
                          current={intake.sugars}
                          unit="g"
                          label={t('home.sugars')}
                      />
                    </div>
                  </div>
                </motion.div>
              </CarouselItem>
            </CarouselContent>
          </Carousel>
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === current ? 'w-4 bg-primary' : 'w-2 bg-muted'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-foreground text-2xl font-semibold">{t('home.todays_analysis')}</h2>
          
          <div 
            className={cn(
                "rounded-xl border-2 border-dashed transition-all duration-300 overflow-hidden",
                isManualEntryOpen ? "border-primary bg-card shadow-sm" : "border-border hover:border-primary/50"
            )}
          >
            <button 
                className="w-full flex items-center justify-between p-4 h-auto min-h-[3.5rem] text-base font-medium text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                onClick={() => setIsManualEntryOpen(!isManualEntryOpen)}
            >
                <span className="flex items-center gap-2">
                    <Utensils className="w-5 h-5" />
                    {t('manual_food.title')}
                </span>
                {isManualEntryOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            <AnimatePresence>
                {isManualEntryOpen && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <div className="px-4 pb-6">
                            <ManualFoodEntry 
                                embedded={true} 
                                onSuccess={() => setIsManualEntryOpen(false)}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
          </div>

          {analyses.length > 0 ? (
            <div className="space-y-3">
              {analyses.map((item) => {
                if ('food_name' in item) {
                  const isMenu = item.analysis_data && isMenuAnalysis(item.analysis_data);
                  
                  return (
                    <SwipeToDelete 
                      key={item.id} 
                      onDelete={() => deleteEntry(item.id, 'food')}
                      className="rounded-xl"
                    >
                      <RecentAnalysisCard 
                        imageUrl={item.image_url}
                        foodName={item.food_name}
                        time={format(new Date(item.created_at), 'p', { locale: es })}
                        calories={item.calories_value}
                        protein={item.protein_value}
                        carbs={item.carbs_value}
                        fats={item.fats_value}
                        sugars={item.sugars_value}
                        status={item.status}
                        reason={item.reason}
                        onClick={() => handleEntryClick(item)}
                        isMenu={!!isMenu}
                      />
                    </SwipeToDelete>
                  );
                } else if ('exercise_type' in item) {
                  return (
                    <SwipeToDelete 
                      key={item.id} 
                      onDelete={() => deleteEntry(item.id, 'exercise')}
                      className="rounded-xl"
                    >
                      <RecentExerciseCard entry={item as ExerciseEntry} />
                    </SwipeToDelete>
                  );
                }
                return null;
              })}
            </div>
          ) : (
            <Card className="p-8 flex flex-col items-center justify-center text-center space-y-2 border-dashed shadow-none bg-muted/20">
              <Plus className="w-12 h-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">{t('home.no_data')}</p>
              <p className="text-sm text-muted-foreground">{t('home.start_logging')}</p>
            </Card>
          )}
        </div>
      </div>
      
      <AnalysisDetailDrawer
        entry={selectedAnalysis}
        isOpen={!!selectedAnalysis}
        onClose={() => setSelectedAnalysis(null)}
      />

      <MenuAnalysisDrawer
        isOpen={isMenuDrawerOpen}
        onClose={() => setIsMenuDrawerOpen(false)}
        data={selectedMenuData}
      />

      <StreakModal 
        isOpen={isStreakModalOpen} 
        onClose={() => setIsStreakModalOpen(false)}
        streak={streak}
        streakDays={streakDays}
      />
    </PageLayout>
  );
};

export default Index;