import { Card } from "@/components/ui/card";
import MacroProgressCircle from "@/components/MacroProgressCircle";
import { ShieldCheck } from "lucide-react";

interface HealthScoreCardProps {
  score: number; // Score from 0 to 100
}

const HealthScoreCard = ({ score }: HealthScoreCardProps) => {
  const safeScore = score || 0;

  let color = "#22c55e"; // Green
  if (safeScore < 75) color = "#f97316"; // Orange
  if (safeScore < 50) color = "#ef4444"; // Red

  const getLabel = () => {
    if (safeScore >= 85) return "Excellent";
    if (safeScore >= 70) return "Good";
    if (safeScore >= 50) return "Fair";
    return "Improvable";
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
      <p className="text-sm text-muted-foreground">Health Score</p>
    </Card>
  );
};

export default HealthScoreCard;