import { Card, CardContent } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { useTranslation } from "react-i18next";
import MacroProgressCircle from "./MacroProgressCircle";
import AnimatedNumber from "./AnimatedNumber";

interface CaloriesCardProps {
  current: number;
  goal: number;
}

const CaloriesCard = ({ current, goal }: CaloriesCardProps) => {
  const { t } = useTranslation();
  const currentVal = current || 0;
  const goalVal = goal || 0;
  
  let percentage = goalVal > 0 ? (currentVal / goalVal) * 100 : 0;
  if (isNaN(percentage)) {
    percentage = 0;
  }

  const remaining = goalVal - currentVal;

  return (
    <Card className="w-full">
      <CardContent className="flex items-center justify-between p-6 gap-4">
        <div className="space-y-2 flex-1">
          <p className="text-5xl font-bold text-foreground leading-none">
            <AnimatedNumber value={currentVal} />
          </p>
          <p className="text-muted-foreground text-sm sm:text-base">
            {remaining >= 0 ? (
              <>
                <AnimatedNumber value={remaining} /> {t('home.kcal_remaining', { count: remaining }).replace(String(remaining), '').trim()}
              </>
            ) : (
              <>
                <AnimatedNumber value={Math.abs(remaining)} /> {t('home.kcal_over', { count: Math.abs(remaining) }).replace(String(Math.abs(remaining)), '').trim()}
              </>
            )}
          </p>
        </div>
        <div className="w-24 h-24 relative flex-shrink-0">
          <MacroProgressCircle value={percentage} color="hsl(var(--primary))" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Flame className="w-8 h-8 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CaloriesCard;