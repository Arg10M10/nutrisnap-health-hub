import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, isAfter, parseISO } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { Flame, Loader2 } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FoodEntry, ExerciseEntry } from "@/context/NutritionContext";

type TimeRange = '7D' | '30D' | '1Y';

const CalorieIntakeChart = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [timeRange, setTimeRange] = useState<TimeRange>('7D');

  const dateLocale = i18n.language === 'es' ? es : enUS;

  const oneYearAgo = useMemo(() => subDays(new Date(), 365).toISOString(), []);

  const { data: foodEntries = [], isLoading: isFoodLoading } = useQuery<FoodEntry[]>({
    queryKey: ['food_entries_1y', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('food_entries').select('created_at, calories_value').eq('user_id', user.id).gte('created_at', oneYearAgo);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const { data: exerciseEntries = [], isLoading: isExerciseLoading } = useQuery<ExerciseEntry[]>({
    queryKey: ['exercise_entries_1y', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('exercise_entries').select('created_at, calories_burned').eq('user_id', user.id).gte('created_at', oneYearAgo);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const uniqueEntryDays = useMemo(() => {
    const allEntries = [...foodEntries, ...exerciseEntries];
    const daySet = new Set<string>();
    allEntries.forEach(entry => {
      const day = format(parseISO(entry.created_at), 'yyyy-MM-dd');
      daySet.add(day);
    });
    return daySet.size;
  }, [foodEntries, exerciseEntries]);

  const show30D = uniqueEntryDays > 7;
  const show1Y = uniqueEntryDays > 30;

  useEffect(() => {
    if (timeRange === '1Y' && !show1Y) {
      setTimeRange(show30D ? '30D' : '7D');
    }
    if (timeRange === '30D' && !show30D) {
      setTimeRange('7D');
    }
  }, [timeRange, show30D, show1Y]);

  const chartData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let daysInRange: number;

    if (timeRange === '7D') {
      startDate = subDays(now, 6);
      daysInRange = 7;
    } else if (timeRange === '30D') {
      startDate = subDays(now, 29);
      daysInRange = 30;
    } else {
      startDate = subDays(now, 364);
      daysInRange = 365;
    }
    startDate.setHours(0, 0, 0, 0);

    const dailyCalories: { [key: string]: number } = {};

    [...foodEntries, ...exerciseEntries].forEach(entry => {
      const entryDate = parseISO(entry.created_at);
      if (isAfter(entryDate, startDate)) {
        const day = format(entryDate, 'yyyy-MM-dd');
        const calories = 'calories_value' in entry ? entry.calories_value : ('calories_burned' in entry ? entry.calories_burned : 0);
        dailyCalories[day] = (dailyCalories[day] || 0) + (calories || 0);
      }
    });
    
    return Array.from({ length: daysInRange }).map((_, i) => {
      const day = subDays(now, daysInRange - 1 - i);
      const dayKey = format(day, 'yyyy-MM-dd');
      return {
        day: format(day, timeRange === '1Y' ? "MMM" : "d MMM", { locale: dateLocale }),
        fullDate: format(day, "PPP", { locale: dateLocale }), // For tooltip
        calories: dailyCalories[dayKey] || 0,
      };
    });
  }, [foodEntries, exerciseEntries, timeRange, dateLocale]);

  const isLoading = isFoodLoading || isExerciseLoading;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dateLabel = payload[0].payload.fullDate || label;
      return (
        <div className="bg-popover border border-border px-3 py-2 rounded-lg shadow-lg">
          <p className="text-xs text-muted-foreground mb-1">{dateLabel}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <p className="font-bold text-popover-foreground text-sm">
              {Math.round(payload[0].value)} kcal
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const toggleItemClasses = "flex-1 rounded-full text-xs font-medium transition-all data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm text-muted-foreground hover:text-foreground";

  return (
    <Card className="border-none shadow-none bg-transparent sm:bg-card sm:border sm:shadow-sm">
      <CardHeader className="px-0 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Flame className="w-5 h-5 text-primary" />
              {t('progress.calorie_intake')}
            </CardTitle>
            <CardDescription>{t('progress.last_7_days')}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-52">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div 
            className="h-52 w-full select-none touch-none"
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              outline: 'none'
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="4 4" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  minTickGap={30}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'transparent' }}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="calories"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
      <CardFooter className="px-0 sm:px-6">
        <ToggleGroup
          type="single"
          value={timeRange}
          onValueChange={(value: TimeRange) => value && setTimeRange(value)}
          className="w-full bg-muted/50 p-1 rounded-full border border-border/50"
        >
          <ToggleGroupItem value="7D" className={toggleItemClasses}>7D</ToggleGroupItem>
          {show30D && (
            <ToggleGroupItem value="30D" className={toggleItemClasses}>30D</ToggleGroupItem>
          )}
          {show1Y && (
            <ToggleGroupItem value="1Y" className={toggleItemClasses}>{t('progress.1y')}</ToggleGroupItem>
          )}
        </ToggleGroup>
      </CardFooter>
    </Card>
  );
};

export default CalorieIntakeChart;