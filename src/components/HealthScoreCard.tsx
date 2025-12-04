import { Card } from "@/components/ui/card";
import MacroProgressCircle from "@/components/MacroProgressCircle";
import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

interface HealthScoreCardProps {
  score: number; // Score from 0 to 100
}

const HealthScoreCard = ({ score }: HealthScoreCardProps) => {
  const { t } = useTranslation();
  const safeScore = score || 0;

  let color = "#22c55e"; // Green
  if (safeScore < 75) color = "#f97316"; // Orange
  if (safeScore < 50) color = "#ef4444"; // Red

  const getLabel = () => {
    if (safeScore >= 85) return t('home.health_score_excellent');
    if (safeScore >= 70) return t('home.health_score_good');
    if (safeScore >= 50) return t('home.health_score_fair');
    return t('home.health_score_improvable');
  };

  return (
    <Card className="p-4 text-center space-y-2 h-full flex flex-col justify-between">
      <div className="w-16 h-16 mx-auto relative">
        <MacroProgressCircle value={safeScore} color={color} />
        <div className="absolute inset-0 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6" style={{ color }} />
        </div>
      </div>
      <p className="text-xl font-bold text-foreground">{getLabel()}</p>
      <p className="text-sm text-muted-foreground">{t('home.health_score')}</p>
    </Card>
  );
};

export default HealthScoreCard;