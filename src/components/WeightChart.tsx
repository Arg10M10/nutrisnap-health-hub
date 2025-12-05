import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from "recharts";
import { TrendingDown, Loader2 } from "lucide-react";

const WeightChart = () => {
  const { user, profile } = useAuth();
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['weight_history', user?.id],
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

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const labelActual = t('progress.weight_progress_actual');
    const labelGoal = t('progress.weight_progress_goal');

    return data.map((entry) => ({
      date: format(new Date(entry.created_at), 'd MMM', { locale: es }),
      [labelActual]: entry.weight,
      ...(profile?.goal_weight ? { [labelGoal]: profile.goal_weight } : {}),
    }));
  }, [data, profile?.goal_weight, t]);

  const labelActual = t('progress.weight_progress_actual');
  const labelGoal = t('progress.weight_progress_goal');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="w-6 h-6 text-primary" />
          {t('progress.weight_progress_title')}
        </CardTitle>
        <CardDescription>{t('progress.weight_progress_desc')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 5, left: -16 }}>
                <XAxis
                  dataKey="date"
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
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 12,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                  }}
                  labelStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                {profile?.goal_weight && (
                  <ReferenceLine
                    y={profile.goal_weight}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey={labelActual}
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, stroke: 'hsl(var(--card))', fill: 'hsl(var(--primary))' }}
                  activeDot={{ r: 5 }}
                />
                {profile?.goal_weight && (
                  <Line
                    type="monotone"
                    dataKey={labelGoal}
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center text-muted-foreground h-64 flex flex-col justify-center items-center">
            <p>{t('progress.weight_progress_no_data')}</p>
            <p className="text-sm">{t('progress.weight_progress_start_logging')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeightChart;