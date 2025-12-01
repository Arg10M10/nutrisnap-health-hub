import { Card } from "@/components/ui/card";
import { Flame, Beef, Wheat, Droplets } from "lucide-react";
import MacroProgressCircle from "./MacroProgressCircle";

interface MacroItemProps {
  value: number;
  color: string;
  icon: React.ReactNode;
  current: number;
  unit: string;
  label: string;
}

const MacroItem = ({ value, color, icon, current, unit, label }: MacroItemProps) => (
  <div className="flex flex-col items-center justify-center text-center space-y-1">
    <div className="w-16 h-16 relative">
      <MacroProgressCircle value={value} color={color} />
      <div className="absolute inset-0 flex items-center justify-center">{icon}</div>
    </div>
    <p className="text-xl font-bold text-foreground">{current.toFixed(0)}{unit}</p>
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

interface MainMacrosCardProps {
  intake: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

const MainMacrosCard = ({ intake, goals }: MainMacrosCardProps) => {
  return (
    <Card className="p-4 h-full">
      <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full">
        <MacroItem
          value={(intake.calories / goals.calories) * 100}
          color="hsl(var(--primary))"
          icon={<Flame className="w-6 h-6 text-primary" />}
          current={intake.calories}
          unit="kcal"
          label="Calorías"
        />
        <MacroItem
          value={(intake.protein / goals.protein) * 100}
          color="#ef4444"
          icon={<Beef className="w-6 h-6 text-red-500" />}
          current={intake.protein}
          unit="g"
          label="Proteína"
        />
        <MacroItem
          value={(intake.carbs / goals.carbs) * 100}
          color="#f97316"
          icon={<Wheat className="w-6 h-6 text-orange-500" />}
          current={intake.carbs}
          unit="g"
          label="Carbs"
        />
        <MacroItem
          value={(intake.fats / goals.fats) * 100}
          color="#3b82f6"
          icon={<Droplets className="w-6 h-6 text-blue-500" />}
          current={intake.fats}
          unit="g"
          label="Grasas"
        />
      </div>
    </Card>
  );
};

export default MainMacrosCard;