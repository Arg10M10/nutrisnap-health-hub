import { cn } from "@/lib/utils";

interface ViewfinderProps {
  className?: string;
  mode?: 'food' | 'barcode' | 'menu';
}

const Viewfinder = ({ className, mode = 'food' }: ViewfinderProps) => {
  let containerClasses = "";
  
  if (mode === 'food') {
    containerClasses = "w-[85vw] h-[55vh] max-w-[400px] max-h-[600px]";
  } else if (mode === 'barcode') {
    containerClasses = "w-[85vw] h-[25vh] max-w-[400px] max-h-[200px]";
  } else if (mode === 'menu') {
    // Más alto y ancho para capturar listas de precios/platos
    containerClasses = "w-[90vw] h-[75vh] max-w-[500px] max-h-[800px]";
  }

  return (
    <div className={cn("absolute inset-0 flex items-center justify-center pointer-events-none", className)}>
      <div
        className={cn(
          "relative rounded-3xl border-2 border-white/90 transition-all duration-300 overflow-hidden",
          containerClasses
        )}
        style={{
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Línea roja para códigos de barras */}
        {mode === 'barcode' && (
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-white/80 rounded-full shadow-[0_0_10px_white]" />
        )}

        {/* Líneas guía para Menús */}
        {mode === 'menu' && (
          <div className="absolute inset-0 flex flex-col justify-center px-8 gap-8 opacity-30">
            {/* Simulando líneas de texto del menú */}
            <div className="h-px w-full bg-white rounded-full" />
            <div className="h-px w-full bg-white rounded-full" />
            <div className="h-px w-full bg-white rounded-full" />
            <div className="h-px w-2/3 bg-white rounded-full" />
            <div className="h-px w-full bg-white rounded-full" />
            <div className="h-px w-full bg-white rounded-full" />
          </div>
        )}
        
        {/* Esquinas decorativas comunes */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-xl -mt-[2px] -ml-[2px]" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-xl -mt-[2px] -mr-[2px]" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-xl -mb-[2px] -ml-[2px]" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-xl -mb-[2px] -mr-[2px]" />
      </div>
    </div>
  );
};

export default Viewfinder;