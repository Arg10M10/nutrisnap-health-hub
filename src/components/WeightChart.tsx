import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, isAfter } from "date-fns";
import { es } from "date-fns/locale";
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
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState<TimeRange>('30D');

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
    
    // Los datos históricos ya están guardados en la unidad que el usuario usó al momento de guardarlos.
    // Asumimos consistencia en la unidad actual.
    
    if (timeRange === 'ALL') {
      return data.map((entry) => ({
        date: format(new Date(entry.created_at), 'd MMM', { locale: es }),
        weight: entry.weight,
      }));
    }

    const now = new Date();
    let startDate: Date;
    if (timeRange === '30D') startDate = subDays(now, 30);
    else if (timeRange === '90D') startDate = subDays(now, 90);
    else startDate = subDays(now, 365); // 1Y

    const filteredData = data.filter(entry => isAfter(new Date(entry.created_at), startDate));

    return filteredData.map((entry) => ({
      date: format(new Date(entry.created_at), 'd MMM', { locale: es }),
      weight: entry.weight,
    }));
  }, [data, timeRange]);

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
  
  const domainMin = Math.floor(minWeight - 5);
  const domainMax = Math.ceil(maxWeight + 5);

  const displayGoalWeight = profile?.goal_weight || null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/80 backdrop-blur-sm p-2 px-4 border rounded-lg shadow-lg">
          <p className="label text-sm text-muted-foreground">{`${label}`}</p>
          <p className="intro font-bold text-foreground">{`${payload[0].value} ${unitLabel}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-primary" />
            {t('progress.weight_progress_title')}
          </CardTitle>
          <Badge variant="outline" className="flex items-center gap-1.5 py-1 px-2">
            <Flag className="w-4 h-4" />
            <span className="font-semibold">
              <AnimatedNumber value={percentageToGoal} toFixed={0} />%
            </span>
            <span className="hidden sm:inline">del objetivo</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : chartData.length > 1 ? (
          <div className="h-64 w-full outline-none focus:outline-none">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={12}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[domainMin, domainMax]}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                {displayGoalWeight && (
                  <ReferenceLine
                    y={displayGoalWeight}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="3 3"
                    label={{ 
                      value: `Meta: ${displayGoalWeight}${unitLabel}`, 
                      position: 'insideBottomRight', 
                      fill: 'hsl(var(--muted-foreground))',
                      fontSize: 10
                    }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--background))', stroke: 'hsl(var(--primary))' }}
                  activeDot={{ r: 8, strokeWidth: 2, fill: 'hsl(var(--background))', stroke: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center text-muted-foreground h-64 flex flex-col justify-center items-center bg-muted/20 rounded-lg border border-dashed">
            <p>{t('progress.weight_progress_no_data')}</p>
            <p className="text-sm mt-1">{t('progress.weight_progress_start_logging')}</p>
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
          <ToggleGroupItem value="30D" className="w-full rounded-full data-[state=on]:bg-background data-[state=on]:shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0">30D</ToggleGroupItem>
          <ToggleGroupItem value="90D" className="w-full rounded-full data-[state=on]:bg-background data-[state=on]:shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0">90D</ToggleGroupItem>
          <ToggleGroupItem value="1Y" className="w-full rounded-full data-[state=on]:bg-background data-[state=on]:shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0">1A</ToggleGroupItem>
          <ToggleGroupItem value="ALL" className="w-full rounded-full data-[state=on]:bg-background data-[state=on]:shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0">Todo</ToggleGroupItem>
        </ToggleGroup>
      </CardFooter>
    </Card>
  );
};

export default WeightChart;