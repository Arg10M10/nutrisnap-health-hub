export default function LightBackground() {
  return (
    <div className="fixed inset-0 -z-50 h-full w-full bg-[#f0fdf4] dark:hidden pointer-events-none">
      {/* Fondo base verde muy claro (green-50) */}
      
      {/* Mancha superior derecha - Verde intenso y notable */}
      <div className="absolute bottom-auto left-auto right-0 top-0 h-[500px] w-[500px] -translate-x-[20%] translate-y-[10%] rounded-full bg-[rgba(34,197,94,0.6)] opacity-70 blur-[80px]"></div>
      
      {/* Mancha inferior izquierda (opcional para balance) */}
      <div className="absolute top-auto right-auto left-0 bottom-0 h-[400px] w-[400px] translate-x-[10%] -translate-y-[10%] rounded-full bg-[rgba(74,222,128,0.5)] opacity-60 blur-[80px]"></div>
    </div>
  );
}