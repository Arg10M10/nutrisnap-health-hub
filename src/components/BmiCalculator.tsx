import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const calculateBmi = (weight: number | null, height: number | null) => {
  if (!weight || !height || height === 0) {
    return { bmi: 0, category: "Incomplete data", badgeClasses: "bg-gray-100 text-gray-800", position: 0 };
  }

  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);

  let category = "";
  let badgeClasses = "";

  if (bmi < 18.5) {
    category = "Underweight";
    badgeClasses = "bg-blue-100 text-blue-800";
  } else if (bmi >= 18.5 && bmi < 25) {
    category = "Healthy";
    badgeClasses = "bg-green-100 text-green-800";
  } else if (bmi >= 25 && bmi < 30) {
    category = "Overweight";
    badgeClasses = "bg-yellow-100 text-yellow-800";
  } else {
    category = "Obesity";
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
            Your BMI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Complete your weight and height in your profile to calculate your BMI.
          </p>
        </CardContent>
      </Card>
    );
  }

  const legendItems = [
    { label: "Underweight", color: "bg-blue-500" },
    { label: "Healthy", color: "bg-green-500" },
    { label: "Overweight", color: "bg-yellow-500" },
    { label: "Obesity", color: "bg-red-500" },
  ];

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between pb-2">
        <CardTitle className={cn(isSmall && "text-lg")}>Your BMI</CardTitle>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="w-5 h-5 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p>The Body Mass Index (BMI) is a measure that relates weight and height.</p>
          </TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent className={cn("pt-4", isSmall ? "space-y-4" : "space-y-6")}>
        <div className="flex items-baseline gap-2 flex-wrap">
          <p className={cn("font-bold text-foreground", isSmall ? "text-4xl" : "text-6xl")}>{bmi}</p>
          <div className="flex items-center gap-2">
            <p className={cn("text-muted-foreground", isSmall ? "text-sm" : "")}>Your weight is</p>
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