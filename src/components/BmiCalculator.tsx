import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import InfoDrawer from "./InfoDrawer";

const calculateBmi = (weight: number | null, height: number | null, t: (key: string) => string) => {
  if (!weight || !height || height === 0) {
    return { bmi: 0, category: "Incomplete data", badgeClasses: "bg-gray-100 text-gray-800", position: 0 };
  }

  // height is usually passed in cm or converted to cm-equivalent before this function if standard metric
  // But here we receive raw values. Calculation expects KG and METERS.
  
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);

  let category = "";
  let badgeClasses = "";

  if (bmi < 18.5) {
    category = t('bmi_calculator.underweight');
    badgeClasses = "bg-blue-100 text-blue-800";
  } else if (bmi >= 18.5 && bmi < 25) {
    category = t('bmi_calculator.healthy');
    badgeClasses = "bg-green-100 text-green-800";
  } else if (bmi >= 25 && bmi < 30) {
    category = t('bmi_calculator.overweight');
    badgeClasses = "bg-yellow-100 text-yellow-800";
  } else {
    category = t('bmi_calculator.obesity');
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
  const { t } = useTranslation();
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  
  const isImperial = profile?.units === 'imperial';
  let weight = profile?.weight;
  let height = profile?.height;

  // Normalizar a métrico (kg, cm) solo para el cálculo del IMC
  if (isImperial && weight && height) {
    weight = weight * 0.453592; // lbs a kg
    height = height * 2.54;     // pulgadas a cm
  }

  const { bmi, category, badgeClasses, position } = calculateBmi(weight, height, t);
  const isSmall = size === 'small';

  if (!profile?.weight || !profile?.height) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", isSmall && "text-lg")}>
            <TrendingUp className="w-6 h-6 text-primary" />
            {t('bmi_calculator.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t('bmi_calculator.incomplete_data')}
          </p>
        </CardContent>
      </Card>
    );
  }

  const legendItems = [
    { label: t('bmi_calculator.underweight'), color: "bg-blue-500" },
    { label: t('bmi_calculator.healthy'), color: "bg-green-500" },
    { label: t('bmi_calculator.overweight'), color: "bg-yellow-500" },
    { label: t('bmi_calculator.obesity'), color: "bg-red-500" },
  ];

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-start justify-between pb-2">
          <CardTitle className={cn(isSmall && "text-lg")}>{t('bmi_calculator.title')}</CardTitle>
          <button onClick={() => setIsInfoOpen(true)}>
            <HelpCircle className="w-5 h-5 text-muted-foreground cursor-help" />
          </button>
        </CardHeader>
        <CardContent className={cn("pt-4", isSmall ? "space-y-4" : "space-y-6")}>
          <div className="flex items-baseline gap-2 flex-wrap">
            <p className={cn("font-bold text-foreground", isSmall ? "text-4xl" : "text-6xl")}>{bmi}</p>
            <div className="flex items-center gap-2">
              <p className={cn("text-muted-foreground", isSmall ? "text-sm" : "")}>{t('bmi_calculator.your_weight_is')}</p>
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
      <InfoDrawer
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        title={t('bmi_calculator.title')}
        icon={<TrendingUp className="w-8 h-8" />}
      >
        <p>{t('bmi_calculator.tooltip')}</p>
      </InfoDrawer>
    </>
  );
};

export default BmiCalculator;