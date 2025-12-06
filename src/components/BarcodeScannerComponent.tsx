import { useRef } from 'react';
import { useZxingScanner } from '@/hooks/useZxingScanner';
import { Loader2, AlertTriangle } from 'lucide-react';

interface BarcodeScannerComponentProps {
  onScan: (result: string) => void;
}

const BarcodeScannerComponent = ({ onScan }: BarcodeScannerComponentProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { error } = useZxingScanner(onScan, videoRef);

  return (
    <div className="w-full h-full relative">
      <video ref={videoRef} className="w-full h-full object-cover" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {error ? (
          <div className="bg-black/70 p-6 rounded-lg flex flex-col items-center gap-4 text-center max-w-sm">
            <AlertTriangle className="w-12 h-12 text-destructive" />
            <p className="font-semibold text-lg">Error de Cámara</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <>
            <div className="w-[80vw] max-w-md h-24 bg-white/10 rounded-lg border-2 border-white/50 relative">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 animate-pulse" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-16 h-16 text-white/50 animate-spin" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BarcodeScannerComponent;