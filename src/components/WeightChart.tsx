import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, isAfter } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Area, AreaChart, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine, CartesianGrid } from "recharts";
import { TrendingDown, Loader2 } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type TimeRange = '7D' | '30D' | '1Y';

const WeightChart = () => {
  const { user, profile } = useAuth();
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState<TimeRange>('30D');

  const { data, isLoading } = useQuery({
    queryKey: ['weight_history_1y', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const oneYearAgo = subDays(new Date(), 365).toISOString();
      const { data, error } = await supabase
        .from('weight_history')
        .select('weight, created_at')
        .eq('user_id', user.id)
        .gte('created_at', oneYearAgo)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const now = new Date();
    let startDate: Date;
    if (timeRange === '7D') startDate = subDays(now, 7);
    else if (timeRange === '30D') startDate = subDays(now, 30);
    else startDate = subDays(now, 365);

    const filteredData = data.filter(entry => isAfter(new Date(entry.created_at), startDate));

    return filteredData.map((entry) => ({
      date: format(new Date(entry.created_at), 'd MMM', { locale: es }),
      weight: entry.weight,
    }));
  }, [data, timeRange]);

  const minWeight = chartData.length > 0 ? Math.min(...chartData.map(d => d.weight)) : 0;
  const maxWeight = chartData.length > 0 ? Math.max(...chartData.map(d => d.weight)) : 100;
  
  const domainMin = Math.floor(minWeight - 2);
  const domainMax = Math.ceil(maxWeight + 2);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-primary" />
              {t('progress.weight_progress_title')}
            </CardTitle>
            <CardDescription>{t('progress.weight_progress_desc')}</CardDescription>
          </div>
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={timeRange}
            onValueChange={(value: TimeRange) => value && setTimeRange(value)}
          >
            <ToggleGroupItem value="7D">7D</ToggleGroupItem>
            <ToggleGroupItem value="30D">30D</ToggleGroupItem>
            <ToggleGroupItem value="1Y">1A</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : chartData.length > 1 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 5, left: -20 }}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={12}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  domain={[domainMin, domainMax]}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 12,
                  }}
                  labelStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: 12, marginBottom: 4 }}
                  cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                {profile?.goal_weight && (
                  <ReferenceLine
                    y={profile.goal_weight}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="3 3"
                    label={{ 
                      value: `Meta: ${profile.goal_weight}kg`, 
                      position: 'insideBottomRight', 
                      fill: 'hsl(var(--muted-foreground))',
                      fontSize: 10
                    }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorWeight)"
                  dot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--background))', stroke: 'hsl(var(--primary))' }}
                  activeDot={{ r: 6, strokeWidth: 2, fill: 'hsl(var(--background))', stroke: 'hsl(var(--primary))' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center text-muted-foreground h-64 flex flex-col justify-center items-center bg-muted/20 rounded-lg border border-dashed">
            <p>{t('progress.weight_progress_no_data')}</p>
            <p className="text-sm mt-1">{t('progress.weight_progress_start_logging')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeightChart;