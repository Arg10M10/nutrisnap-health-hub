import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Exercise } from "@/data/exercises";
import { Info, Timer, ListOrdered } from "lucide-react";

interface ExerciseDetailDrawerProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
}

const ExerciseDetailDrawer = ({ exercise, isOpen, onClose }: ExerciseDetailDrawerProps) => {
  if (!exercise) return null;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh] flex flex-col">
        <DrawerHeader className="text-left p-6 pb-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <exercise.icon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <DrawerTitle className="text-3xl font-bold text-foreground">{exercise.name}</DrawerTitle>
              <DrawerDescription className="text-lg text-muted-foreground">{exercise.category}</DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <div data-vaul-scrollable className="overflow-y-auto flex-1">
          <div className="px-6 pb-6 space-y-6">
            <div>
              <h3 className="font-semibold text-xl mb-3 text-primary flex items-center gap-2">
                <Info className="w-6 h-6" /> ¿Qué es?
              </h3>
              <p className="text-base text-muted-foreground">{exercise.whatItIs}</p>
            </div>

            <div>
              <h3 className="font-semibold text-xl mb-3 text-primary flex items-center gap-2">
                <Timer className="w-6 h-6" /> Duración y Frecuencia
              </h3>
              <p className="text-base text-muted-foreground">{exercise.duration}</p>
            </div>

            <div>
              <h3 className="font-semibold text-xl mb-3 text-primary flex items-center gap-2">
                <ListOrdered className="w-6 h-6" /> ¿Cómo hacerlo?
              </h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                {exercise.howToDoIt.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <DrawerFooter className="pt-4 border-t flex-shrink-0">
          <Button onClick={onClose} size="lg">Entendido</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ExerciseDetailDrawer;