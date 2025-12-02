import { Leaf, Loader2 } from 'lucide-react';

const SplashScreen = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background space-y-6">
      <Leaf className="w-24 h-24 text-primary" />
      <div className="flex items-center gap-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Cargando tu experiencia...</p>
      </div>
    </div>
  );
};

export default SplashScreen;