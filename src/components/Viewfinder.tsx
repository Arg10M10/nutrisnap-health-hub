import { cn } from "@/lib/utils";

interface ViewfinderProps {
  className?: string;
  mode?: 'food' | 'barcode' | 'menu';
}

const Viewfinder = ({ className, mode = 'food' }: ViewfinderProps) => {
  let containerClasses = "";
  
  if (mode === 'food') {
    // Cuadrado perfecto para platos de comida
    containerClasses = "w-[80vw] aspect-square max-w-[350px]";
  } else if (mode === 'barcode') {
    // Rectangular horizontal estrecho para códigos de barras
    containerClasses = "w-[85vw] h-[20vh] max-w-[400px] max-h-[180px]";
  } else if (mode === 'menu') {
    // Rectangular vertical (tipo documento) para menús
    // Altura controlada para no chocar con la UI
    containerClasses = "w-[80vw] h-[60vh] max-w-[400px]";
  }

  return (
    <div className={cn("absolute inset-0 flex items-center justify-center pointer-events-none", className)}>
      <div
        className={cn(
          "relative rounded-3xl border-2 border-white/90 transition-all duration-500 ease-in-out overflow-hidden shadow-2xl",
          containerClasses
        )}
        style={{
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)', // Efecto de oscurecimiento exterior
        }}
      >
        {/* Línea roja para códigos de barras */}
        {mode === 'barcode' && (
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-red-500/80 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
        )}

        {/* Líneas guía para Menús - Más visibles y espaciadas */}
        {mode === 'menu' && (
          <div className="absolute inset-0 flex flex-col justify-center px-10 gap-8 opacity-60">
            {/* Simulando líneas de texto del menú */}
            <div className="h-0.5 w-full bg-white/80 rounded-full shadow-sm" />
            <div className="h-0.5 w-full bg-white/80 rounded-full shadow-sm" />
            <div className="h-0.5 w-full bg-white/80 rounded-full shadow-sm" />
            <div className="h-0.5 w-3/4 bg-white/80 rounded-full shadow-sm" />
            <div className="h-0.5 w-full bg-white/80 rounded-full shadow-sm" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Viewfinder;