import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles, Crown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface PremiumLockDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const PremiumLockDrawer = ({ isOpen, onClose }: PremiumLockDrawerProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleUnlock = () => {
    onClose();
    navigate('/subscribe');
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader className="text-center pt-8">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 shadow-sm relative">
              <Crown className="w-8 h-8 text-yellow-600" />
              <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 border shadow-sm">
                <Lock className="w-4 h-4 text-primary" />
              </div>
            </div>
            <DrawerTitle className="text-2xl font-bold text-foreground">Función Premium</DrawerTitle>
            <DrawerDescription className="text-base mt-2 text-muted-foreground leading-relaxed">
              Esta herramienta utiliza Inteligencia Artificial avanzada para analizar tus alimentos y crear planes personalizados.
              <br/><br/>
              <span className="font-semibold text-primary">Desbloquea todo el potencial de Calorel.</span>
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="pb-8 px-6 gap-3">
            <Button onClick={handleUnlock} size="lg" className="w-full h-14 text-lg rounded-2xl shadow-lg shadow-yellow-500/20 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white border-none">
              <Sparkles className="mr-2 h-5 w-5" />
              Desbloquear Ahora
            </Button>
            <Button variant="ghost" onClick={onClose} size="lg" className="w-full h-12 rounded-xl text-muted-foreground">
              Quizás más tarde
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default PremiumLockDrawer;