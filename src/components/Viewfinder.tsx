import { cn } from "@/lib/utils";

interface ViewfinderProps {
  className?: string;
}

const Viewfinder = ({ className }: ViewfinderProps) => {
  const cornerClasses = "absolute w-16 h-16 border-[6px] rounded-2xl border-white";
  return (
    <div className={cn("absolute inset-0 flex items-center justify-center pointer-events-none", className)}>
      <div className="relative w-[85vw] h-[55vh] max-w-[400px] max-h-[600px]">
        <div className={cn(cornerClasses, "border-r-transparent border-b-transparent -top-2 -left-2")} />
        <div className={cn(cornerClasses, "border-l-transparent border-b-transparent -top-2 -right-2")} />
        <div className={cn(cornerClasses, "border-r-transparent border-t-transparent -bottom-2 -left-2")} />
        <div className={cn(cornerClasses, "border-l-transparent border-t-transparent -bottom-2 -right-2")} />
      </div>
    </div>
  );
};

export default Viewfinder;