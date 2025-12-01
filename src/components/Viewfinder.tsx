import { cn } from "@/lib/utils";

interface ViewfinderProps {
  className?: string;
}

const Viewfinder = ({ className }: ViewfinderProps) => {
  const cornerClasses = "absolute w-10 h-10 border-2 rounded-lg border-white";
  return (
    <div className={cn("absolute inset-0 flex items-center justify-center pointer-events-none", className)}>
      <div className="relative w-[95vw] h-[95vw] max-w-[500px] max-h-[500px]">
        <div className={cn(cornerClasses, "border-r-transparent border-b-transparent top-0 left-0")} />
        <div className={cn(cornerClasses, "border-l-transparent border-b-transparent top-0 right-0")} />
        <div className={cn(cornerClasses, "border-r-transparent border-t-transparent bottom-0 left-0")} />
        <div className={cn(cornerClasses, "border-l-transparent border-t-transparent bottom-0 right-0")} />
      </div>
    </div>
  );
};

export default Viewfinder;