import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeartPulse, ChefHat, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export type AnalysisResult = {
  foodName: string;
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
  sugars: string;
  fiber?: string;
  healthRating: string;
  reason: string;
  ingredients?: string[]; 
};

interface FoodAnalysisCardProps {
  result: AnalysisResult;
}

const getRatingStyle = (rating: string) => {
  const normalized = rating.toLowerCase();
  
  if (normalized.includes('healthy') || normalized.includes('saludable')) {
    return 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100';
  }
  if (normalized.includes('moderate') || normalized.includes('moderado')) {
    return 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100';
  }
  if (normalized.includes('avoid') || normalized.includes('evitar')) {
    return 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100';
  }
  
  return 'bg-secondary text-secondary-foreground hover:bg-secondary';
};

const getTranslatedRating = (rating: string, t: (key: string) => string) => {
  const normalized = rating.toLowerCase();
  if (normalized.includes('healthy') || normalized.includes('saludable')) return t('analysis.health_rating.healthy');
  if (normalized.includes('moderate') || normalized.includes('moderado')) return t('analysis.health_rating.moderate');
  if (normalized.includes('avoid') || normalized.includes('evitar')) return t('analysis.health_rating.avoid');
  return rating;
};

// Helper para extraer números de strings como "20g" o "120 kcal"
const extractNumber = (val: string) => {
  const match = val.match(/\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : 0;
};

// Componente interno para las barras de macro
const MacroBar = ({ label, valueStr, colorClass, bgClass, maxVal = 100 }: { label: string, valueStr: string, colorClass: string, bgClass: string, maxVal?: number }) => {
  const val = extractNumber(valueStr);
  // Calculamos un porcentaje visual relativo a un máximo estimado (solo para efecto visual)
  const percentage = Math.min((val / maxVal) * 100, 100);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-end">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <div className={cn("h-2.5 w-full rounded-full overflow-hidden", bgClass)}>
        <div 
          className={cn("h-full rounded-full transition-all duration-500", colorClass)} 
          style={{ width: `${Math.max(percentage, 5)}%` }} // Mínimo 5% para que se vea algo
        />
      </div>
      <span className="text-lg font-bold text-foreground mt-0.5">{valueStr}</span>
    </div>
  );
};

const FoodAnalysisCard = ({ result }: FoodAnalysisCardProps) => {
  const { t } = useTranslation();

  return (
    <Card className="w-full border-none shadow-sm bg-card overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="text-3xl font-black text-foreground leading-tight tracking-tight">
            {result.foodName}
          </CardTitle>
          <Badge className={cn("text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-none border", getRatingStyle(result.healthRating))}>
            {getTranslatedRating(result.healthRating, t)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-8">
        {/* Sección de Calorías Estilo Moderno */}
        <div className="flex justify-between items-center py-2">
          <div>
            <p className="text-base font-semibold text-muted-foreground mb-1">{t('analysis.calories')}</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-6xl font-black text-foreground tracking-tighter">
                {extractNumber(result.calories)}
              </span>
              <span className="text-2xl font-bold text-muted-foreground/60">kcal</span>
            </div>
          </div>
          
          {/* Indicador Circular Visual */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="6"
                className="text-muted/30"
              />
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 36}
                strokeDashoffset={2 * Math.PI * 36 * (1 - 0.75)} // 75% fijo visual
                strokeLinecap="round"
                className="text-primary"
              />
            </svg>
            <Sparkles className="w-8 h-8 text-primary absolute" strokeWidth={2.5} />
          </div>
        </div>

        {/* Grid de Macros Moderno */}
        <div className="grid grid-cols-3 gap-x-6 gap-y-6">
          <MacroBar 
            label={t('analysis.carbs')} 
            valueStr={result.carbs} 
            colorClass="bg-orange-500" 
            bgClass="bg-orange-100 dark:bg-orange-500/20"
            maxVal={80} 
          />
          <MacroBar 
            label={t('analysis.fats')} 
            valueStr={result.fats} 
            colorClass="bg-blue-500" 
            bgClass="bg-blue-100 dark:bg-blue-500/20"
            maxVal={40} 
          />
          <MacroBar 
            label={t('analysis.protein')} 
            valueStr={result.protein} 
            colorClass="bg-red-500" 
            bgClass="bg-red-100 dark:bg-red-500/20"
            maxVal={50} 
          />
          
          {/* Fila secundaria para Azúcares y Fibra */}
          <div className="col-span-1.5 hidden sm:block"> {/* Espaciador si necesario */} </div>
          <MacroBar 
            label={t('analysis.sugars')} 
            valueStr={result.sugars} 
            colorClass="bg-purple-500" 
            bgClass="bg-purple-100 dark:bg-purple-500/20"
            maxVal={30} 
          />
          <MacroBar 
            label={t('analysis.fiber')} 
            valueStr={result.fiber || '0g'} 
            colorClass="bg-emerald-500" 
            bgClass="bg-emerald-100 dark:bg-emerald-500/20"
            maxVal={20} 
          />
        </div>

        {/* Ingredientes */}
        {result.ingredients && result.ingredients.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <ChefHat className="w-4 h-4" /> 
              {t('analysis.detected_ingredients')}
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.ingredients.map((item, index) => (
                <span 
                  key={index} 
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-muted text-sm font-medium text-foreground capitalize border border-border/50"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recomendación / Razón */}
        <div className="bg-primary/5 rounded-2xl p-4 flex items-start gap-3 border border-primary/10">
          <div className="bg-primary/10 p-2 rounded-full mt-0.5">
            <HeartPulse className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-bold text-foreground text-sm mb-1">{t('analysis.recommendation')}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {result.reason}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FoodAnalysisCard;