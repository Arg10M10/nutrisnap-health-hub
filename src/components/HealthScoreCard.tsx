import { Card } from "@/components/ui/card";
import MacroProgressCircle from "@/components/MacroProgressCircle";
import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

interface HealthScoreCardProps {
  score: number;
}

const HealthScoreCard = ({ score }: HealthScoreCardProps) => {
  const { t } = useTranslation();
  const safeScore = score; // Permitimos 0 para lógica de "Sin Datos"

  // Definición de colores basada en el nuevo algoritmo (Escala más estricta)
  let color = "#22c55e"; // Green (80-100)
  if (safeScore > 0 && safeScore < 80) color = "#f97316"; // Orange (50-79) - Moderado
  if (safeScore > 0 && safeScore < 50) color = "#ef4444"; // Red (1-49) - Malo
  if (safeScore === 0) color = "#9ca3af"; // Gray (0) - Sin Datos

  const getLabel = () => {
    if (safeScore === 0) return "--"; // O "Inicio"
    if (safeScore >= 80) return t('home.health_score_excellent');
    if (safeScore >= 50) return t('home.health_score_good'); // Aunque sea "moderado", visualmente es "Bueno" o "Regular"
    return t('home.health_score_improvable');
  };

  return (
    <Card className="p-3 text-center h-full flex flex-col justify-center items-center gap-2 shadow-sm">
      <div className="w-20 h-20 relative flex-shrink-0">
        <MacroProgressCircle value={safeScore || 100} color={color} /> 
        {/* Si es 0 (sin datos), mostramos el círculo gris lleno o vacío. Lleno (100) en gris se ve mejor como placeholder */}
        
        <div className="absolute inset-0 flex items-center justify-center">
          <ShieldCheck className="w-10 h-10" style={{ color }} />
        </div>
      </div>
      <div className="min-w-0 w-full">
        <p className="text-xl font-black text-foreground leading-tight truncate">{getLabel()}</p>
        <p className="text-xs text-muted-foreground uppercase tracking-wide truncate mt-1 font-bold">{t('home.health_score')}</p>
      </div>
    </Card>
  );
};

export default HealthScoreCard;