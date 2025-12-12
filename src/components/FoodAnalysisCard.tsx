import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Droplets, HeartPulse, Beef, Wheat, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

export type AnalysisResult = {
  foodName: string;
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
  sugars: string;
  healthRating: string; // Changed from strict literal to string to handle various inputs
  reason: string;
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
  
  // Default to moderate if unknown
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
        <div className="flex justify-between items-start">
          <CardTitle className="text-2xl text-primary">{result.foodName}</CardTitle>
          <Badge className={`text-sm ${getRatingStyle(result.healthRating)}`}>
            {getTranslatedRating(result.healthRating, t)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 text-center">
          <div className="p-4 bg-muted rounded-lg">
            <Flame className="w-6 h-6 mx-auto text-primary mb-1" />
            <p className="text-lg font-bold text-foreground">{result.calories}</p>
            <p className="text-sm text-muted-foreground">{t('analysis.calories')}</p>
          </div>
        </div>
         <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-3 bg-muted rounded-lg">
            <Beef className="w-5 h-5 mx-auto text-red-500 mb-1" />
            <p className="font-bold text-foreground">{result.protein}</p>
            <p className="text-xs text-muted-foreground">{t('analysis.protein')}</p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <Wheat className="w-5 h-5 mx-auto text-orange-500 mb-1" />
            <p className="font-bold text-foreground">{result.carbs}</p>
            <p className="text-xs text-muted-foreground">{t('analysis.carbs')}</p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <Droplets className="w-5 h-5 mx-auto text-yellow-500 mb-1" />
            <p className="font-bold text-foreground">{result.fats}</p>
            <p className="text-xs text-muted-foreground">{t('analysis.fats')}</p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <Sparkles className="w-5 h-5 mx-auto text-purple-500 mb-1" />
            <p className="font-bold text-foreground">{result.sugars}</p>
            <p className="text-xs text-muted-foreground">{t('analysis.sugars')}</p>
          </div>
        </div>
        <div>
          <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
            <HeartPulse className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground mb-1">{t('analysis.recommendation')}</h4>
              <p className="text-muted-foreground text-sm">{result.reason}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FoodAnalysisCard;