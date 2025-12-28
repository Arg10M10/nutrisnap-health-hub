import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Droplets, HeartPulse, Beef, Wheat, Sparkles, ChefHat } from "lucide-react";
import { useTranslation } from "react-i18next";

export type AnalysisResult = {
  foodName: string;
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
  sugars: string;
  healthRating: string;
  reason: string;
  ingredients?: string[]; // Nuevo campo opcional
};

interface FoodAnalysisCardProps {
  result: AnalysisResult;
}

const getRatingStyle = (rating: string) => {
  const normalized = rating.toLowerCase();
  
  if (normalized.includes('healthy') || normalized.includes('saludable')) {
    return 'bg-green-100 text-green-800 border-green-200';
  }
  if (normalized.includes('moderate') || normalized.includes('moderado')) {
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }
  if (normalized.includes('avoid') || normalized.includes('evitar')) {
    return 'bg-red-100 text-red-800 border-red-200';
  }
  
  return 'bg-yellow-100 text-yellow-800 border-yellow-200';
};

const getTranslatedRating = (rating: string, t: (key: string) => string) => {
  const normalized = rating.toLowerCase();
  if (normalized.includes('healthy') || normalized.includes('saludable')) return t('analysis.health_rating.healthy');
  if (normalized.includes('moderate') || normalized.includes('moderado')) return t('analysis.health_rating.moderate');
  if (normalized.includes('avoid') || normalized.includes('evitar')) return t('analysis.health_rating.avoid');
  return rating;
};

const FoodAnalysisCard = ({ result }: FoodAnalysisCardProps) => {
  const { t } = useTranslation();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-2xl text-primary leading-tight">{result.foodName}</CardTitle>
          <Badge className={`text-sm whitespace-nowrap ${getRatingStyle(result.healthRating)}`}>
            {getTranslatedRating(result.healthRating, t)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 text-center">
          <div className="p-4 bg-muted rounded-lg border border-border/50">
            <Flame className="w-6 h-6 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold text-foreground">{result.calories}</p>
            <p className="text-sm text-muted-foreground font-medium">{t('analysis.calories')}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 bg-muted/50 rounded-lg border border-border/30">
            <Beef className="w-5 h-5 mx-auto text-red-500 mb-1" />
            <p className="font-bold text-foreground text-lg">{result.protein}</p>
            <p className="text-xs text-muted-foreground font-medium">{t('analysis.protein')}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg border border-border/30">
            <Wheat className="w-5 h-5 mx-auto text-orange-500 mb-1" />
            <p className="font-bold text-foreground text-lg">{result.carbs}</p>
            <p className="text-xs text-muted-foreground font-medium">{t('analysis.carbs')}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg border border-border/30">
            <Droplets className="w-5 h-5 mx-auto text-blue-500 mb-1" />
            <p className="font-bold text-foreground text-lg">{result.fats}</p>
            <p className="text-xs text-muted-foreground font-medium">{t('analysis.fats')}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg border border-border/30">
            <Sparkles className="w-5 h-5 mx-auto text-purple-500 mb-1" />
            <p className="font-bold text-foreground text-lg">{result.sugars}</p>
            <p className="text-xs text-muted-foreground font-medium">{t('analysis.sugars')}</p>
          </div>
        </div>

        {/* Sección de Ingredientes Detectados - Lista Vertical */}
        {result.ingredients && result.ingredients.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2 text-sm uppercase tracking-wide opacity-80 pl-1">
              <ChefHat className="w-4 h-4" /> 
              {t('analysis.detected_ingredients')}
            </h4>
            <div className="flex flex-col gap-2">
              {result.ingredients.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center px-4 py-3 rounded-xl bg-muted/30 border border-border/50"
                >
                  <div className="h-2 w-2 rounded-full bg-primary/60 mr-3 shadow-sm flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground capitalize">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/50">
            <HeartPulse className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1 text-sm">{t('analysis.recommendation')}</h4>
              <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">{result.reason}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FoodAnalysisCard;