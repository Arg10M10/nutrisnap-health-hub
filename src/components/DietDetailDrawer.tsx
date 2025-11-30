import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Diet } from "@/data/diets";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X } from "lucide-react";

interface DietDetailDrawerProps {
  diet: Diet | null;
  isOpen: boolean;
  onClose: () => void;
}

const DietDetailDrawer = ({ diet, isOpen, onClose }: DietDetailDrawerProps) => {
  if (!diet) return null;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <ScrollArea className="max-h-[80vh]">
          <div className="p-6">
            <DrawerHeader className="text-left p-0 mb-4">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-5xl">{diet.icon}</span>
                <div>
                  <DrawerTitle className="text-3xl font-bold text-foreground">{diet.name}</DrawerTitle>
                  <DrawerDescription className="text-lg text-muted-foreground">{diet.description}</DrawerDescription>
                </div>
              </div>
            </DrawerHeader>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-xl mb-3 text-primary flex items-center gap-2">
                  <Check className="w-6 h-6" /> Qué comer
                </h3>
                <div className="flex flex-wrap gap-2">
                  {diet.foodsToEat.map((food) => (
                    <Badge key={food} variant="outline" className="text-base py-1 px-3 bg-primary/10 border-primary/20 text-primary">
                      {food}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-xl mb-3 text-destructive flex items-center gap-2">
                  <X className="w-6 h-6" /> Qué evitar
                </h3>
                <div className="flex flex-wrap gap-2">
                  {diet.foodsToAvoid.map((food) => (
                    <Badge key={food} variant="destructive" className="text-base py-1 px-3">
                      {food}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        <DrawerFooter className="pt-4 border-t">
          <Button onClick={onClose} size="lg">Cerrar</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default DietDetailDrawer;