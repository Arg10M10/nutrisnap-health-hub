import { Card, CardContent } from "@/components/ui/card";
import { Footprints } from "lucide-react";
import AnimatedNumber from "./AnimatedNumber";

interface StepsCardProps {
  steps: number;
}

const StepsCard = ({ steps }: StepsCardProps) => {
  return (
    <Card className="shadow-sm border-none bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] h-full flex flex-col justify-center">
      <CardContent className="flex items-center justify-between p-6 gap-4">
        <div className="space-y-1">
          <p className="text-4xl font-black text-blue-600 dark:text-blue-400">
            <AnimatedNumber value={steps} />
          </p>
          <p className="text-sm font-semibold text-blue-600/70 dark:text-blue-400/70 uppercase tracking-wide">
            Pasos Hoy
          </p>
        </div>
        <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
          <Footprints className="w-7 h-7 text-blue-600 dark:text-blue-400" />
        </div>
      </CardContent>
    </Card>
  );
};

export default StepsCard;