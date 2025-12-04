import { useState, useMemo, useEffect } from "react";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageLayout from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { Flame, Leaf, ScanLine, Beef, Wheat, Droplets, Sparkles } from "lucide-react";
import { useNutrition } from "@/context/NutritionContext";
import { useAuth } from "@/context/AuthContext";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import HealthScoreCard from "@/components/HealthScoreCard";
import WaterTrackerCard from "@/components/WaterTrackerCard";
import MacroCard from "@/components/MacroCard";
import CaloriesCard from "@/components/CaloriesCard";
import RecentAnalysisCard from "@/components/RecentAnalysisCard";
import AnimatedNumber from "@/components/AnimatedNumber";

const Index = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { getDataForDate, streak, streakDays, addWaterGlass, removeWaterGlass, isWaterUpdating } = useNutrition();
  const { profile } = useAuth();
  const { intake, analyses, healthScore, waterIntake } = getDataForDate(selectedDate);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const { t } = useTranslation();

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
    water: 8,
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

  const cardVariants = {
    active: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    inactive: { opacity: 0.6, scale: 0.95, transition: { duration: 0.3, ease: "easeOut" } },
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-primary" />
            <h1 className="text-primary text-3xl">{t('home.title')}</h1>
          </div>
          <Link to="/badges" className="flex items-center gap-2 bg-background border text-foreground px-3 py-1.5 rounded-full shadow-md transition-transform active:scale-95">
            <Flame className="w-5 h-5 text-orange-400 fill-current" />
            <span className="font-bold text-sm">
              <AnimatedNumber value={streak} />
            </span>
          </Link>
        </header>

        <WeeklyCalendar 
          selectedDate={selectedDate} 
          onDateSelect={setSelectedDate} 
          weeklyCalorieData={weeklyCalorieData}
        />

        <div>
          <Carousel className="w-full" opts={{ align: "start", duration: 20 }} setApi={setApi}>
            <CarouselContent>
              {/* Page 1: Main Macros */}
              <CarouselItem>
                <motion.div variants={cardVariants} animate={current === 0 ? "active" : "inactive"}>
                  <div className="p-1 h-[360px] flex flex-col gap-2">
                    <div className="flex-[2]">
                      <CaloriesCard current={intake.calories} goal={dailyGoals.calories} />
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <MacroCard
                        value={getSafePercentage(intake.protein, dailyGoals.protein)}
                        color="#ef4444"
                        icon={<Beef className="w-6 h-6 text-red-500" />}
                        current={intake.protein}
                        unit="g"
                        label={t('home.protein')}
                      />
                      <MacroCard
                        value={getSafePercentage(intake.carbs, dailyGoals.carbs)}
                        color="#f97316"
                        icon={<Wheat className="w-6 h-6 text-orange-500" />}
                        current={intake.carbs}
                        unit="g"
                        label={t('home.carbs')}
                      />
                      <MacroCard
                        value={getSafePercentage(intake.fats, dailyGoals.fats)}
                        color="#3b82f6"
                        icon={<Droplets className="w-6 h-6 text-blue-500" />}
                        current={intake.fats}
                        unit="g"
                        label={t('home.fats')}
                      />
                    </div>
                  </div>
                </motion.div>
              </CarouselItem>

              {/* Page 2: Secondary Metrics */}
              <CarouselItem>
                <motion.div variants={cardVariants} animate={current === 1 ? "active" : "inactive"}>
                  <div className="p-1 h-[360px] flex flex-col gap-2">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <HealthScoreCard score={healthScore} />
                      <WaterTrackerCard
                        count={waterIntake}
                        goal={dailyGoals.water}
                        onAdd={() => addWaterGlass(selectedDate)}
                        onRemove={() => removeWaterGlass(selectedDate)}
                        isUpdating={isWaterUpdating}
                      />
                    </div>
                    <div className="flex-1">
                      <MacroCard
                          value={getSafePercentage(intake.sugars, dailyGoals.sugars)}
                          color="#a855f7"
                          icon={<Sparkles className="w-6 h-6 text-purple-500" />}
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
          {analyses.length > 0 ? (
            <div className="space-y-3">
              {analyses.map((item) => (
                <RecentAnalysisCard 
                  key={item.id} 
                  imageUrl={item.image_url}
                  foodName={item.food_name}
                  time={format(new Date(item.created_at), 'p', { locale: es })}
                  calories={item.calories_value}
                  protein={item.protein_value}
                  carbs={item.carbs_value}
                  fats={item.fats_value}
                  sugars={item.sugars_value}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 flex flex-col items-center justify-center text-center space-y-2">
              <ScanLine className="w-12 h-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">{t('home.no_data')}</p>
              <p className="text-sm text-muted-foreground">{t('home.start_logging')}</p>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Index;