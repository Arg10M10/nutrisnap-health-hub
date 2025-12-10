import { cn } from "@/lib/utils";

interface ViewfinderProps {
  className?: string;
  mode?: 'food' | 'barcode';
}

const Viewfinder = ({ className, mode = 'food' }: ViewfinderProps) => {
  const containerClasses = mode === 'food' 
    ? "w-[85vw] h-[55vh] max-w-[400px] max-h-[600px]"
    : "w-[85vw] h-[25vh] max-w-[400px] max-h-[200px]";

  return (
    <div className={cn("absolute inset-0 flex items-center justify-center pointer-events-none", className)}>
      <div
        className={cn(
          "relative rounded-3xl border-2 border-white/90 transition-all duration-300",
          containerClasses
        )}
        style={{
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
        }}
      >
        {mode === 'barcode' && (
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-white/80 rounded-full shadow-[0_0_10px_white]" />
        )}
      </div>
    </div>
  );
};

export default Viewfinder;