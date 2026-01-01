import { Card } from "@/components/ui/card";
import MacroProgressCircle from "@/components/MacroProgressCircle";
import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

interface HealthScoreCardProps {
  score: number;
}

const HealthScoreCard = ({ score }: HealthScoreCardProps) => {
  const { t } = useTranslation();
  const safeScore = score;

  // Usamos el color primario (lima) definido en CSS global
  const color = "hsl(var(--primary))";

  const getLabel = () => {
    if (safeScore === 0) return "--";
    if (safeScore >= 80) return t('home.health_score_excellent');
    if (safeScore >= 50) return t('home.health_score_good');
    return t('home.health_score_improvable');
  };

  return (
    <Card className="p-4 text-center h-full flex flex-col justify-center items-center gap-3 shadow-sm border-none bg-card rounded-[2rem]">
      <div className="w-20 h-20 relative flex-shrink-0">
        <MacroProgressCircle value={safeScore || 100} color={color} />
        <div className="absolute inset-0 flex items-center justify-center">
          <ShieldCheck className="w-9 h-9" style={{ color }} />
        </div>
      </div>
      <div className="min-w-0 w-full">
        <p className="text-lg font-bold text-foreground leading-tight truncate">{getLabel()}</p>
        <p className="text-xs text-muted-foreground font-medium mt-1">{t('home.health_score')}</p>
      </div>
    </Card>
  );
};

export default HealthScoreCard;