import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const calculateBmi = (weight: number | null, height: number | null) => {
  if (!weight || !height || height === 0) {
    return { bmi: 0, category: "Datos incompletos", badgeClasses: "bg-gray-100 text-gray-800", position: 0 };
  }

  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);

  let category = "";
  let badgeClasses = "";

  if (bmi < 18.5) {
    category = "Bajo peso";
    badgeClasses = "bg-blue-100 text-blue-800";
  } else if (bmi >= 18.5 && bmi < 25) {
    category = "Saludable";
    badgeClasses = "bg-green-100 text-green-800";
  } else if (bmi >= 25 && bmi < 30) {
    category = "Sobrepeso";
    badgeClasses = "bg-yellow-100 text-yellow-800";
  } else {
    category = "Obesidad";
    badgeClasses = "bg-red-100 text-red-800";
  }

  const minBmi = 15;
  const maxBmi = 40;
  const position = ((Math.min(Math.max(bmi, minBmi), maxBmi) - minBmi) / (maxBmi - minBmi)) * 100;

  return { bmi: parseFloat(bmi.toFixed(1)), category, badgeClasses, position };
};

interface BmiCalculatorProps {
  size?: 'small' | 'large';
}

const BmiCalculator = ({ size = 'large' }: BmiCalculatorProps) => {
  const { profile } = useAuth();
  const { bmi, category, badgeClasses, position } = calculateBmi(profile?.weight, profile?.height);
  const isSmall = size === 'small';

  if (!profile?.weight || !profile?.height) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", isSmall && "text-lg")}>
            <TrendingUp className="w-6 h-6 text-primary" />
            Tu IMC
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Completa tu peso y altura en tu perfil para calcular tu IMC.
          </p>
        </CardContent>
      </Card>
    );
  }

  const legendItems = [
    { label: "Bajo peso", color: "bg-blue-500" },
    { label: "Saludable", color: "bg-green-500" },
    { label: "Sobrepeso", color: "bg-yellow-500" },
    { label: "Obesidad", color: "bg-red-500" },
  ];

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between pb-2">
        <CardTitle className={cn(isSmall && "text-lg")}>Tu IMC</CardTitle>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="w-5 h-5 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p>El Índice de Masa Corporal (IMC) es una medida que relaciona el peso y la altura.</p>
          </TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent className={cn("pt-4", isSmall ? "space-y-4" : "space-y-6")}>
        <div className="flex items-baseline gap-2 flex-wrap">
          <p className={cn("font-bold text-foreground", isSmall ? "text-4xl" : "text-6xl")}>{bmi}</p>
          <div className="flex items-center gap-2">
            <p className={cn("text-muted-foreground", isSmall ? "text-sm" : "")}>Tu peso es</p>
            <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold", badgeClasses, isSmall && "text-xs px-2")}>
              {category}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="relative h-3 w-full rounded-full bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 to-red-500">
            <div
              className="absolute top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-white shadow-md"
              style={{ left: `calc(${position}% - 2px)` }}
            />
          </div>
          <div className="flex flex-wrap justify-between text-xs text-muted-foreground gap-x-4 gap-y-1">
            {legendItems.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full", item.color)} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BmiCalculator;