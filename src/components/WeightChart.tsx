import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingDown, Loader2 } from "lucide-react";

const WeightChart = () => {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['weight_history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('weight_history')
        .select('weight, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(30);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const chartData = useMemo(() => {
    return data?.map(entry => ({
      date: format(new Date(entry.created_at), 'd MMM', { locale: es }),
      weight: entry.weight,
    })) || [];
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="w-6 h-6 text-primary" />
          Progreso de Peso
        </CardTitle>
        <CardDescription>Últimos 30 registros</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : chartData.length > 1 ? (
          <ChartContainer config={{}} className="h-64 w-full">
            <LineChart data={chartData} margin={{ top: 20, right: 10, bottom: 5, left: -16 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} domain={['dataMin - 2', 'dataMax + 2']} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="text-center text-muted-foreground h-64 flex flex-col justify-center items-center">
            <p>No hay suficientes datos para mostrar una gráfica.</p>
            <p className="text-sm">Registra tu peso al menos dos veces para ver tu progreso.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeightChart;