import { useMemo, useState } from "react";
import { format, subDays } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";
import { Footprints } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type TimeRange = '7D' | '30D';

const StepsChart = () => {
  const { t, i18n } = useTranslation();
  const [timeRange, setTimeRange] = useState<TimeRange>('7D');

  const dateLocale = i18n.language === 'es' ? es : enUS;

  const chartData = useMemo(() => {
    const now = new Date();
    const daysInRange = timeRange === '7D' ? 7 : 30;
    
    return Array.from({ length: daysInRange }).map((_, i) => {
      const day = subDays(now, daysInRange - 1 - i);
      const dateNum = day.getDate();
      // Simulación de datos consistente con NutritionContext
      const baseSteps = 3000 + (dateNum * 150); 
      const steps = baseSteps + Math.floor(Math.sin(dateNum) * 1000); 

      return {
        day: format(day, "d MMM", { locale: dateLocale }),
        steps: steps,
      };
    });
  }, [timeRange, dateLocale]);

  const toggleItemClasses = "flex-1 rounded-full text-xs font-medium transition-all data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm text-muted-foreground hover:text-foreground";

  return (
    <Card className="border-none shadow-none bg-transparent sm:bg-card sm:border sm:shadow-sm">
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
        >
          <ToggleGroupItem value="7D" className={toggleItemClasses}>7D</ToggleGroupItem>
          <ToggleGroupItem value="30D" className={toggleItemClasses}>30D</ToggleGroupItem>
        </ToggleGroup>
      </CardFooter>
    </Card>
  );
};

export default StepsChart;