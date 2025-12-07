import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface InfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  icon?: ReactNode;
}

const InfoDrawer = ({ isOpen, onClose, title, children, icon }: InfoDrawerProps) => {
  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh] flex flex-col">
        <DrawerHeader className="text-left p-6 pb-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            {icon && <div className="text-primary flex-shrink-0">{icon}</div>}
            <DrawerTitle className="text-2xl font-bold text-foreground">{title}</DrawerTitle>
          </div>
        </DrawerHeader>

        <div data-vaul-scrollable className="overflow-y-auto flex-1">
          <div className="px-6 pb-6 space-y-4 text-muted-foreground text-base">
            {children}
          </div>
        </div>

        <DrawerFooter className="pt-4 border-t flex-shrink-0">
          <Button onClick={onClose} size="lg">Entendido</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default InfoDrawer;