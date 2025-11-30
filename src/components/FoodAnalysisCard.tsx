import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Droplets, HeartPulse } from "lucide-react";

export type AnalysisResult = {
  foodName: string;
  calories: string;
  sugars: string;
  healthRating: 'Saludable' | 'Moderado' | 'Evitar';
  reason: string;
};

interface FoodAnalysisCardProps {
  result: AnalysisResult;
}

const ratingStyles = {
  'Saludable': 'bg-green-100 text-green-800 border-green-200',
  'Moderado': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Evitar': 'bg-red-100 text-red-800 border-red-200',
};

const FoodAnalysisCard = ({ result }: FoodAnalysisCardProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-2xl text-primary">{result.foodName}</CardTitle>
          <Badge className={`text-sm ${ratingStyles[result.healthRating]}`}>
            {result.healthRating}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-4 bg-muted rounded-lg">
            <Flame className="w-6 h-6 mx-auto text-primary mb-1" />
            <p className="text-lg font-bold text-foreground">{result.calories}</p>
            <p className="text-sm text-muted-foreground">Calorías</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <Droplets className="w-6 h-6 mx-auto text-primary mb-1" />
            <p className="text-lg font-bold text-foreground">{result.sugars}</p>
            <p className="text-sm text-muted-foreground">Azúcares</p>
          </div>
        </div>
        <div>
          <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
            <HeartPulse className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground mb-1">Recomendación</h4>
              <p className="text-muted-foreground text-sm">{result.reason}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FoodAnalysisCard;