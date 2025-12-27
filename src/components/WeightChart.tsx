import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, isAfter } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Area, AreaChart, XAxis, YAxis, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { TrendingDown, Loader2, Flag } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import AnimatedNumber from "./AnimatedNumber";

type TimeRange = '30D' | '90D' | '1Y' | 'ALL';

const WeightChart = () => {
  const { user, profile } = useAuth();
  const { t, i18n } = useTranslation();
  const [timeRange, setTimeRange] = useState<TimeRange>('30D');

  const dateLocale = i18n.language === 'es' ? es : enUS;

  const { data, isLoading } = useQuery({
    queryKey: ['weight_history_all', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('weight_history')
        .select('weight, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const isImperial = profile?.units === 'imperial';

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const now = new Date();
    let startDate: Date;
    
    if (timeRange === 'ALL') {
      startDate = new Date(0); // Epoch
    } else if (timeRange === '30D') {
      startDate = subDays(now, 30);
    } else if (timeRange === '90D') {
      startDate = subDays(now, 90);
    } else {
      startDate = subDays(now, 365); // 1Y
    }

    // Filtrar primero
    const filteredData = data.filter(entry => isAfter(new Date(entry.created_at), startDate));

    // Luego mapear
    return filteredData.map((entry) => ({
      rawDate: new Date(entry.created_at),
      date: format(new Date(entry.created_at), 'd MMM', { locale: dateLocale }),
      weight: entry.weight,
    }));
  }, [data, timeRange, dateLocale]);

  const percentageToGoal = useMemo(() => {
    if (profile?.starting_weight && profile.goal_weight && profile.weight) {
      const totalToChange = Math.abs(profile.starting_weight - profile.goal_weight);
      if (totalToChange === 0) return 100;
      const changedSoFar = Math.abs(profile.starting_weight - profile.weight);
      return Math.min(100, (changedSoFar / totalToChange) * 100);
    }
    return 0;
  }, [profile]);

  const minWeight = chartData.length > 0 ? Math.min(...chartData.map(d => d.weight)) : 0;
  const maxWeight = chartData.length > 0 ? Math.max(...chartData.map(d => d.weight)) : 100;
  
  // Ajuste dinámico del eje Y para que la gráfica se vea bien
  const padding = (maxWeight - minWeight) * 0.2; // Aumentado padding para mejor visualización
  const domainMin = Math.floor(Math.max(0, minWeight - padding));
  const domainMax = Math.ceil(maxWeight + padding);

  const displayGoalWeight = profile?.goal_weight || null;

  const toggleItemClasses = "flex-1 rounded-full text-xs font-medium transition-all data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm text-muted-foreground hover:text-foreground";

  return (
    <Card className="border-none shadow-none bg-transparent sm:bg-card sm:border sm:shadow-sm">
      <CardHeader className="px-0 sm:px-6">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingDown className="w-5 h-5 text-primary" />
            {t('progress.weight_progress_title')}
          </CardTitle>
          <Badge variant="outline" className="flex items-center gap-1.5 py-1 px-2 border-primary/20 bg-primary/5 text-primary">
            <Flag className="w-3.5 h-3.5" />
            <span className="font-semibold text-xs">
              <AnimatedNumber value={percentageToGoal} toFixed={0} />%
            </span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : chartData.length > 1 ? (
          <div 
            className="h-64 w-full pointer-events-none select-none pl-2" // Added pl-2 for axis space
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={chartData} 
                margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="4 4" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  minTickGap={30}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  domain={[domainMin, domainMax]}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8} // Reduced tickMargin slightly
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }}
                  width={40} // Increased width for labels
                  unit={isImperial ? '' : ''} // Removed unit from axis to save space, it's clear from context
                />
                {displayGoalWeight && (
                  <ReferenceLine
                    y={displayGoalWeight}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="3 3"
                    strokeOpacity={0.5}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorWeight)"
                  activeDot={{ 
                    r: 6, 
                    strokeWidth: 4, 
                    stroke: "hsl(var(--background))", 
                    fill: "hsl(var(--primary))" 
                  }}
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center text-muted-foreground h-64 flex flex-col justify-center items-center bg-muted/20 rounded-lg border border-dashed border-border/50">
            <p className="text-sm">{t('progress.weight_progress_no_data')}</p>
            <p className="text-xs mt-1 opacity-70">{t('progress.weight_progress_start_logging')}</p>
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
          <ToggleGroupItem value="30D" className={toggleItemClasses}>30D</ToggleGroupItem>
          <ToggleGroupItem value="90D" className={toggleItemClasses}>90D</ToggleGroupItem>
          <ToggleGroupItem value="1Y" className={toggleItemClasses}>{t('progress.1y')}</ToggleGroupItem>
          <ToggleGroupItem value="ALL" className={toggleItemClasses}>{t('progress.chart_all')}</ToggleGroupItem>
        </ToggleGroup>
      </CardFooter>
    </Card>
  );
};

export default WeightChart;