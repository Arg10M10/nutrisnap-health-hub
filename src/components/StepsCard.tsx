import { Card, CardContent } from "@/components/ui/card";
import { Footprints } from "lucide-react";
import AnimatedNumber from "./AnimatedNumber";

interface StepsCardProps {
  steps: number;
}

const StepsCard = ({ steps }: StepsCardProps) => {
  return (
    <Card className="h-full flex flex-col items-center justify-center p-4 text-center space-y-2">
      <Footprints className="w-10 h-10 text-primary" />
      <p className="text-4xl font-bold text-foreground">
        <AnimatedNumber value={steps} />
      </p>
      <p className="text-sm text-muted-foreground">Pasos Hoy</p>
    </Card>
  );
};

export default StepsCard;