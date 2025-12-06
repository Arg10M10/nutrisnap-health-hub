import { cn } from "@/lib/utils";

interface ViewfinderProps {
  className?: string;
  mode?: 'food' | 'barcode';
}

const Viewfinder = ({ className, mode = 'food' }: ViewfinderProps) => {
  const cornerClasses = "absolute w-16 h-16 border-[6px] rounded-2xl border-white";
  
  const containerClasses = mode === 'food' 
    ? "relative w-[85vw] h-[55vh] max-w-[400px] max-h-[600px]"
    : "relative w-[85vw] h-[25vh] max-w-[400px] max-h-[200px]";

  return (
    <div className={cn("absolute inset-0 flex items-center justify-center pointer-events-none", className)}>
      <div className={containerClasses}>
        <div className={cn(cornerClasses, "border-r-transparent border-b-transparent -top-2 -left-2")} />
        <div className={cn(cornerClasses, "border-l-transparent border-b-transparent -top-2 -right-2")} />
        <div className={cn(cornerClasses, "border-r-transparent border-t-transparent -bottom-2 -left-2")} />
        <div className={cn(cornerClasses, "border-l-transparent border-t-transparent -bottom-2 -right-2")} />
        
        {mode === 'barcode' && (
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/80 shadow-[0_0_10px_white]" />
        )}
      </div>
    </div>
  );
};

export default Viewfinder;