import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { useTranslation } from 'react-i18next';

export const FinalStep = () => {
  const { t } = useTranslation();
  const chartData = [
    { app: t('onboarding.final.other_apps'), exito: 45 },
    { app: 'Calorel', exito: 85 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('onboarding.final.chart_title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-64 w-full">
          <ResponsiveContainer>
            <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} unit="%" />
              <YAxis type="category" dataKey="app" width={80} tickLine={false} axisLine={false} />
              <Bar dataKey="exito" fill="hsl(var(--primary))" radius={8} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};