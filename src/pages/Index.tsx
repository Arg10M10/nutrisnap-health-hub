import { useState, useMemo, useEffect } from "react";
import { format, subDays } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { motion, Variants } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { Flame, Leaf, Plus, Beef, Wheat, Droplets, Sparkles, Sprout } from "lucide-react";
import { useNutrition, FoodEntry } from "@/context/NutritionContext";
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
import StreakModal from "@/components/StreakModal";
import SwipeToDelete from "@/components/SwipeToDelete";
import MenuAnalysisDrawer, { MenuAnalysisData } from "@/components/MenuAnalysisDrawer";
import { AnalysisResult } from "@/components/FoodAnalysisCard";
import { toast } from "sonner";
import GuestBanner from "@/components/GuestBanner";

const Index = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { getDataForDate, streak, streakDays, addWaterGlass, removeWaterGlass, isWaterUpdating, deleteEntry, addAnalysis } = useNutrition();
  const { profile } = useAuth();
  const { intake, analyses, healthScore, waterIntake } = getDataForDate(selectedDate);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const { t } = useTranslation();
  
  const [selectedAnalysis, setSelectedAnalysis] = useState<FoodEntry | null>(null);
  const [selectedMenuData, setSelectedMenuData] = useState<MenuAnalysisData | null>(null);
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);

  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const navigate = useNavigate();

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
    water: 64, 
    sugars: profile?.goal_sugars || 25,
    fiber: profile?.goal_fiber || 30, // Default 30g
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

  const handleSelectMenuMeal = (meal: AnalysisResult) => {
    addAnalysis(meal);
    setIsMenuDrawerOpen(false);
    toast.success(t('analysis.save_to_diary'));
  };

  return (
    <PageLayout>
      <AppTutorial />
      <div className="space-y-8">
        <header className="flex justify-between items-center px-1 pt-2">
          <div className="flex items-center gap-3">
            <Leaf className="w-9 h-9 text-foreground fill-current" strokeWidth={2.5} />
            <h1 className="text-4xl font-black tracking-tighter text-foreground">Calorel</h1>
          </div>
          
          <button 
            onClick={() => setIsStreakModalOpen(true)}
            className="flex items-center gap-2 bg-muted/30 backdrop-blur-md px-4 py-2 rounded-full transition-transform active:scale-95 hover:bg-muted/50"
          >
            <Flame className="w-5 h-5 text-orange-500 fill-current" />
            <span className="font-bold text-lg text-foreground">
              <AnimatedNumber value={streak} />
            </span>
          </button>
        </header>

        {/* Mostrar banner para TODOS los que NO tengan suscripción activa */}
        {!profile?.is_subscribed && (
          <GuestBanner />
        )}

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
                  <div className="flex flex-col gap-4 h-[350px]">
                    <div className="flex-1 w-full min-h-0">
                      <CaloriesCard current={intake.calories} goal={dailyGoals.calories} className="h-full" />
                    </div>
                    <div className="h-[150px] w-full flex-shrink-0">
                      <div className="grid grid-cols-3 gap-3 w-full h-full">
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
                  <div className="flex flex-col gap-4 h-[350px]">
                    <div className="flex-1 w-full min-h-0">
                      <div className="grid grid-cols-2 gap-3 w-full h-full">
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
                    <div className="h-[150px] w-full flex-shrink-0">
                      <div className="grid grid-cols-2 gap-3 w-full h-full">
                        <MacroCard
                            value={getSafePercentage(intake.sugars, dailyGoals.sugars)}
                            color="#a855f7"
                            icon={<Sparkles className="w-5 h-5 text-purple-500" />}
                            current={intake.sugars}
                            unit="g"
                            label={t('home.sugars')}
                        />
                        <MacroCard
                            value={getSafePercentage(intake.fiber, dailyGoals.fiber)}
                            color="#10b981" // Verde esmeralda para fibra
                            icon={<Sprout className="w-5 h-5 text-emerald-500" />}
                            current={intake.fiber}
                            unit="g"
                            label={t('home.fiber')}
                        />
                      </div>
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
          <h2 className="text-foreground text-2xl font-bold px-1">{t('home.todays_analysis')}</h2>
          
          {analyses.length > 0 ? (
            <div className="space-y-3">
              {analyses.map((item) => {
                if ('food_name' in item) {
                  const isMenu = item.analysis_data && isMenuAnalysis(item.analysis_data);
                  
                  return (
                    <SwipeToDelete 
                      key={item.id} 
                      onDelete={() => deleteEntry(item.id, 'food')}
                      className="rounded-2xl"
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
                        fiber={item.fiber_value} // Pasamos la fibra
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
                      className="rounded-2xl"
                    >
                      <RecentExerciseCard entry={item as ExerciseEntry} />
                    </SwipeToDelete>
                  );
                }
                return null;
              })}
            </div>
          ) : (
            <Card className="p-8 flex flex-col items-center justify-center text-center space-y-3 border-dashed shadow-none bg-muted/20 rounded-[2rem]">
              <Plus className="w-12 h-12 text-muted-foreground/50" />
              <p className="text-muted-foreground font-medium">{t('home.no_data')}</p>
              <p className="text-sm text-muted-foreground opacity-80">{t('home.start_logging')}</p>
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
        onSelectMeal={handleSelectMenuMeal}
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