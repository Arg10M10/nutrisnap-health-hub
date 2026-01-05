import { Card } from "@/components/ui/card";
import { Flame } from "lucide-react";
import AnimatedNumber from "./AnimatedNumber";
import MacroProgressCircle from "./MacroProgressCircle";
import { useTranslation } from "react-i18next";
import { useHealthConnect } from "@/hooks/useHealthConnect";
import { useQuery } from "@tanstack/react-query";
import { HealthConnectPlaceholder } from "./HealthConnectPlaceholder";

interface ActiveCaloriesCardProps {
  date?: Date;
}

const ActiveCaloriesCard = ({ date }: ActiveCaloriesCardProps) => {
  const { t } = useTranslation();
  const { isConnected, getDailyData } = useHealthConnect();
  
  const queryDate = date || new Date();

  const { data } = useQuery({
    queryKey: ['health_calories_daily', queryDate.toISOString()],
    queryFn: () => getDailyData(queryDate),
    enabled: isConnected,
    staleTime: 1000 * 60 * 5, 
  });

  if (!isConnected) {
    return (
      <Card className="shadow-sm border-none bg-card rounded-[2rem] h-full p-0 overflow-hidden">
         <HealthConnectPlaceholder label={t('home.active_calories')} />
      </Card>
    );
  }

  const calories = data?.calories || 0;
  // Meta de ejemplo 500, o dinámica si existiera en perfil
  const percentage = Math.min((calories / 500) * 100, 100); 

  return (
    <Card className="p-3 flex flex-col items-center justify-center h-full gap-2 shadow-sm border-none bg-card rounded-[2rem]">
      <div className="w-14 h-14 relative flex-shrink-0">
        <MacroProgressCircle value={percentage} color="#f97316" /> {/* Naranja */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Flame className="w-6 h-6 text-orange-500" />
        </div>
      </div>
      <div className="flex flex-col items-center w-full min-w-0">
        <p className="font-bold text-lg text-foreground leading-none">
          <AnimatedNumber value={calories} />
          <span className="text-xs ml-0.5 font-medium text-muted-foreground">kcal</span>
        </p>
        <p className="text-xs text-muted-foreground font-medium mt-1 capitalize">{t('home.active_calories')}</p>
      </div>
    </Card>
  );
};

export default ActiveCaloriesCard;