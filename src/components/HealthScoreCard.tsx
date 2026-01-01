import { Card } from "@/components/ui/card";
import MacroProgressCircle from "@/components/MacroProgressCircle";
import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

interface HealthScoreCardProps {
  score: number;
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
    <Card className="p-3 text-center h-full flex flex-col justify-center items-center gap-1 shadow-sm">
      <div className="w-12 h-12 relative flex-shrink-0">
        <MacroProgressCircle value={safeScore} color={color} />
        <div className="absolute inset-0 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <div className="min-w-0 w-full">
        <p className="text-base font-bold text-foreground leading-tight truncate">{getLabel()}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide truncate">{t('home.health_score')}</p>
      </div>
    </Card>
  );
};

export default HealthScoreCard;