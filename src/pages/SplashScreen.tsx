import { Leaf } from 'lucide-react';

const SplashScreen = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <Leaf className="w-24 h-24 text-primary" />
    </div>
  );
};

export default SplashScreen;