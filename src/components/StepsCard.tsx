import { Card, CardContent } from "@/components/ui/card";
import { Footprints } from "lucide-react";
import AnimatedNumber from "./AnimatedNumber";
import { useTranslation } from "react-i18next";
import { useHealthConnect } from "@/hooks/useHealthConnect";
import { useQuery } from "@tanstack/react-query";
import { HealthConnectPlaceholder } from "./HealthConnectPlaceholder";

interface StepsCardProps {
  date?: Date; // Optional date override
}

const StepsCard = ({ date }: StepsCardProps) => {
  const { t } = useTranslation();
  const { isConnected, getDailyData } = useHealthConnect();
  
  const queryDate = date || new Date();

  const { data } = useQuery({
    queryKey: ['health_steps_daily', queryDate.toISOString()],
    queryFn: () => getDailyData(queryDate),
    enabled: isConnected,
    staleTime: 1000 * 60 * 5, // 5 minutos cache
  });

  if (!isConnected) {
    return (
      <Card className="shadow-sm border-none bg-card rounded-[2rem] h-full overflow-hidden p-0">
        <HealthConnectPlaceholder label={t('home.steps')} />
      </Card>
    );
  }

  const steps = data?.steps || 0;

  return (
    <Card className="shadow-sm border-none bg-card rounded-[2rem] h-full flex flex-col justify-center">
      <CardContent className="flex items-center justify-between p-6 gap-4">
        <div className="space-y-1">
          <p className="text-5xl font-black text-foreground">
            <AnimatedNumber value={steps} />
          </p>
          <p className="text-lg font-medium text-muted-foreground">
            {t('home.steps')}
          </p>
        </div>
        <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
          <Footprints className="w-10 h-10 text-blue-500" />
        </div>
      </CardContent>
    </Card>
  );
};

export default StepsCard;