import { Leaf } from "lucide-react";

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center">
      <Leaf className="w-16 h-16 text-primary animate-pulse" />
      <p className="text-muted-foreground mt-4">Cargando...</p>
    </div>
  );
};

export default SplashScreen;