import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';

const chartData = [
  { app: 'Otras Apps', exito: 45 },
  { app: 'NutriSnap', exito: 85 },
];

export const FinalStep = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tu Éxito Potencial</CardTitle>
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