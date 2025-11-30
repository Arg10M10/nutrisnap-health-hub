import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, HeartPulse } from "lucide-react";

interface Nutrient {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  sugars: number;
}

interface BarcodeAnalysisCardProps {
  name: string;
  brands: string;
  imageUrl: string | null;
  servingSize: string;
  nutrients: Nutrient;
  rating?: {
    healthRating: 'Saludable' | 'Moderado' | 'Evitar';
    reason: string;
  };
  isRatingLoading: boolean;
}

const ratingStyles = {
  'Saludable': 'bg-green-100 text-green-800 border-green-200',
  'Moderado': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Evitar': 'bg-red-100 text-red-800 border-red-200',
};

const NutrientRow = ({ label, value, unit }: { label: string; value: number; unit: string }) => (
  <div className="flex justify-between items-center py-2 border-b">
    <p className="text-muted-foreground">{label}</p>
    <p className="font-semibold text-foreground">{value.toFixed(1)} {unit}</p>
  </div>
);

const BarcodeAnalysisCard = ({ name, brands, imageUrl, servingSize, nutrients, rating, isRatingLoading }: BarcodeAnalysisCardProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        {imageUrl && <img src={imageUrl} alt={name} className="w-full h-48 object-contain rounded-t-lg mb-4" />}
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl text-primary">{name}</CardTitle>
            <CardDescription>{brands}</CardDescription>
          </div>
          {rating && (
            <Badge className={`text-sm ${ratingStyles[rating.healthRating]}`}>
              {rating.healthRating}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-foreground mb-2">Información Nutricional (por 100g)</h4>
          <div className="space-y-1">
            <NutrientRow label="Calorías" value={nutrients.calories} unit="kcal" />
            <NutrientRow label="Proteína" value={nutrients.protein} unit="g" />
            <NutrientRow label="Carbohidratos" value={nutrients.carbs} unit="g" />
            <NutrientRow label="Azúcares" value={nutrients.sugars} unit="g" />
            <NutrientRow label="Grasas" value={nutrients.fats} unit="g" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Tamaño de porción sugerido: {servingSize}</p>
        </div>
        
        <div>
          <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg min-h-[80px]">
            <HeartPulse className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground mb-1">Recomendación de la IA</h4>
              {isRatingLoading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
              {rating && <p className="text-muted-foreground text-sm">{rating.reason}</p>}
              {!isRatingLoading && !rating && <p className="text-muted-foreground text-sm">Obteniendo recomendación...</p>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BarcodeAnalysisCard;