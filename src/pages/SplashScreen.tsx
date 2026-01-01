import { useTheme } from 'next-themes';
import { Leaf } from 'lucide-react';

const SplashScreen = () => {
  const { resolvedTheme } = useTheme();

  // The video will only play in light mode.
  // For dark mode, we'll show the original Leaf icon as a fallback.
  if (resolvedTheme === 'light') {
    return (
      <div className="fixed inset-0 w-full h-full bg-background flex items-center justify-center">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/calorel-light.mp4" type="video/mp4" />
        </video>
      </div>
    );
  }

  // Fallback for dark mode or if theme is not resolved yet
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <Leaf className="w-24 h-24 text-primary" />
    </div>
  );
};

export default SplashScreen;