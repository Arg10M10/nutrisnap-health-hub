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
        day: format(day, "d MMM", { locale: dateLocale }),
        calories: dailyCalories[dayKey] || 0,
      };
    });
  }, [foodEntries, exerciseEntries, timeRange, dateLocale]);

  const isLoading = isFoodLoading || isExerciseLoading;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/80 backdrop-blur-sm p-2 px-4 border rounded-lg shadow-lg">
          <p className="label text-sm text-muted-foreground">{`${label}`}</p>
          <p className="intro font-bold text-foreground">{`${payload[0].value} kcal`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-primary" />
              {t('progress.calorie_intake')}
            </CardTitle>
            <CardDescription>{t('progress.last_7_days')}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 5, left: -16 }}>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={false}
                />
                <Bar
                  dataKey="calories"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={timeRange}
          onValueChange={(value: TimeRange) => value && setTimeRange(value)}
          className="w-full bg-muted p-1 rounded-full"
        >
          <ToggleGroupItem value="7D" className="w-full rounded-full data-[state=on]:bg-background data-[state=on]:shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0">7D</ToggleGroupItem>
          {show30D && (
            <ToggleGroupItem value="30D" className="w-full rounded-full data-[state=on]:bg-background data-[state=on]:shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0">30D</ToggleGroupItem>
          )}
          {show1Y && (
            <ToggleGroupItem value="1Y" className="w-full rounded-full data-[state=on]:bg-background data-[state=on]:shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0">{t('progress.1y')}</ToggleGroupItem>
          )}
        </ToggleGroup>
      </CardFooter>
    </Card>
  );
};

export default CalorieIntakeChart;