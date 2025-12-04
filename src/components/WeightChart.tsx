import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingDown, Loader2 } from "lucide-react";

const GOAL_RATE_KG_PER_WEEK = 0.5; // Healthy weight change rate

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
    if (!data || data.length === 0 || !profile?.starting_weight || !profile.goal) {
      return [];
    }

    const firstEntryDate = new Date(data[0].created_at);
    let ratePerDay = (GOAL_RATE_KG_PER_WEEK / 7);

    if (profile.goal === 'lose_weight') {
      ratePerDay = -ratePerDay;
    } else if (profile.goal === 'maintain_weight') {
      ratePerDay = 0;
    }

    return data.map(entry => {
      const currentDate = new Date(entry.created_at);
      const daysSinceStart = differenceInDays(currentDate, firstEntryDate);
      const goalWeight = profile.starting_weight + (daysSinceStart * ratePerDay);
      
      return {
        date: format(currentDate, 'd MMM', { locale: es }),
        [t('progress.weight_progress_actual')]: entry.weight,
        [t('progress.weight_progress_goal')]: parseFloat(goalWeight.toFixed(1)),
      };
    });
  }, [data, profile, t]);

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
          <ChartContainer config={{}} className="h-64 w-full">
            <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: -16 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} domain={['dataMin - 2', 'dataMax + 2']} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Legend />
              <Line type="monotone" dataKey={t('progress.weight_progress_actual')} stroke="hsl(var(--primary))" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey={t('progress.weight_progress_goal')} stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="3 3" dot={false} />
            </LineChart>
          </ChartContainer>
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