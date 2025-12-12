import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, isAfter } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
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
  const unitLabel = isImperial ? 'lbs' : 'kg';

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
      fullDate: format(new Date(entry.created_at), 'PPP', { locale: dateLocale }),
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
  
  const domainMin = Math.floor(minWeight - 2);
  const domainMax = Math.ceil(maxWeight + 2);

  const displayGoalWeight = profile?.goal_weight || null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dateLabel = payload[0].payload.fullDate || label;
      return (
        <div className="bg-popover border border-border px-3 py-2 rounded-lg shadow-lg">
          <p className="text-xs text-muted-foreground mb-1">{dateLabel}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <p className="font-bold text-popover-foreground text-sm">
              {payload[0].value} {unitLabel}
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
          <div className="flex justify-center items-center h-52">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : chartData.length > 1 ? (
          <div 
            className="h-52 w-full select-none touch-pan-y" 
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              outline: 'none'
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={chartData} 
                margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
                accessibilityLayer={false}
              >
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
                  tickMargin={10}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  width={35}
                />
                <Tooltip 
                  content={<CustomTooltip />} 
                  cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }} 
                  isAnimationActive={false}
                />
                {displayGoalWeight && (
                  <ReferenceLine
                    y={displayGoalWeight}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="3 3"
                    strokeOpacity={0.5}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={{ 
                    r: 4, 
                    fill: "hsl(var(--primary))", 
                    strokeWidth: 2, 
                    stroke: "hsl(var(--background))",
                    cursor: 'pointer'
                  }}
                  activeDot={{ 
                    r: 6, 
                    strokeWidth: 0, 
                    fill: 'hsl(var(--primary))',
                    cursor: 'pointer'
                  }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center text-muted-foreground h-52 flex flex-col justify-center items-center bg-muted/20 rounded-lg border border-dashed border-border/50">
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