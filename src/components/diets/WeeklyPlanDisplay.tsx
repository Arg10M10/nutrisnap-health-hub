import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Utensils, RefreshCw } from 'lucide-react';

type MealPlan = {
  [day: string]: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snack: string;
  };
};

interface WeeklyPlanDisplayProps {
  plan: MealPlan;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export const WeeklyPlanDisplay = ({ plan, onRegenerate, isRegenerating }: WeeklyPlanDisplayProps) => {
  const sortedDays = Object.entries(plan).sort(([dayA], [dayB]) => dayOrder.indexOf(dayA) - dayOrder.indexOf(dayB));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Tu Plan Semanal Personalizado</CardTitle>
          <CardDescription>Este es el plan que la IA ha creado para ti. ¡Buen provecho!</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible defaultValue="monday">
            {sortedDays.map(([day, meals]) => (
              <AccordionItem value={day} key={day}>
                <AccordionTrigger className="capitalize text-lg">{day}</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div className="flex items-start gap-3"><Utensils className="w-5 h-5 text-muted-foreground mt-1" /><p><span className="font-semibold">Desayuno:</span> {meals.breakfast}</p></div>
                  <div className="flex items-start gap-3"><Utensils className="w-5 h-5 text-muted-foreground mt-1" /><p><span className="font-semibold">Almuerzo:</span> {meals.lunch}</p></div>
                  <div className="flex items-start gap-3"><Utensils className="w-5 h-5 text-muted-foreground mt-1" /><p><span className="font-semibold">Cena:</span> {meals.dinner}</p></div>
                  <div className="flex items-start gap-3"><Utensils className="w-5 h-5 text-muted-foreground mt-1" /><p><span className="font-semibold">Snack:</span> {meals.snack}</p></div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
      <Button variant="outline" size="lg" className="w-full h-14 text-lg" onClick={onRegenerate} disabled={isRegenerating}>
        <RefreshCw className="mr-2 h-5 w-5" />
        Volver a generar plan
      </Button>
    </div>
  );
};