import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";
import { Footprints, Lock } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useHealthConnect } from "@/hooks/useHealthConnect";
import { useQuery } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

type TimeRange = '7D' | '30D';

const StepsChart = () => {
  const { t, i18n } = useTranslation();
  const [timeRange, setTimeRange] = useState<TimeRange>('7D');
  const { isConnected, getHistoryData } = useHealthConnect();
  const navigate = useNavigate();

  const dateLocale = i18n.language === 'es' ? es : enUS;

  const { data: historyData = [] } = useQuery({
    queryKey: ['health_steps_history', timeRange],
    queryFn: () => getHistoryData(timeRange === '7D' ? 7 : 30),
    enabled: isConnected,
    staleTime: 1000 * 60 * 10, // 10 min cache
  });

  const chartData = useMemo(() => {
    if (!isConnected || historyData.length === 0) return [];

    return historyData.map((day) => ({
      day: format(day.date, "d MMM", { locale: dateLocale }),
      steps: day.steps,
    }));
  }, [historyData, dateLocale, isConnected]);

  const toggleItemClasses = "flex-1 rounded-full text-xs font-medium transition-all data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm text-muted-foreground hover:text-foreground";

  return (
    <Card className="border-none shadow-none bg-transparent sm:bg-card sm:border sm:shadow-sm relative overflow-hidden">
      
      {!isConnected && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] p-6 text-center">
           <div className="bg-muted p-4 rounded-full mb-4">
              <Lock className="w-8 h-8 text-muted-foreground" />
           </div>
           <h3 className="text-lg font-bold mb-2">{t('connect_apps.title')}</h3>
           <p className="text-sm text-muted-foreground mb-4 max-w-xs">
             Conecta Health Connect para ver tu historial de pasos y actividad real.
           </p>
           <Button onClick={() => navigate('/settings/connect-apps')} variant="outline" className="rounded-full">
             Conectar Ahora
           </Button>
        </div>
      )}

      <CardHeader className="px-0 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Footprints className="w-5 h-5 text-blue-500" />
              {t('home.steps') || 'Pasos'}
            </CardTitle>
            <CardDescription>{t('progress.last_7_days')}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        <div className="h-52 w-full pointer-events-none select-none">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
                data={isConnected ? chartData : Array(7).fill({ steps: 0, day: '-' })} 
                margin={{ top: 10, right: 0, bottom: 0, left: -20 }}
            >
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
              <Bar
                dataKey="steps"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
                isAnimationActive={true}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="px-0 sm:px-6">
        <ToggleGroup
          type="single"
          value={timeRange}
          onValueChange={(value: TimeRange) => value && setTimeRange(value)}
          className="w-full bg-muted/50 p-1 rounded-full border border-border/50"
          disabled={!isConnected}
        >
          <ToggleGroupItem value="7D" className={toggleItemClasses}>7D</ToggleGroupItem>
          <ToggleGroupItem value="30D" className={toggleItemClasses}>30D</ToggleGroupItem>
        </ToggleGroup>
      </CardFooter>
    </Card>
  );
};

export default StepsChart;