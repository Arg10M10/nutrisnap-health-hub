import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const GuestBanner = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const handleClaim = () => {
    if (profile?.is_guest) {
      // Si es invitado, primero debe registrarse
      navigate('/register-premium', { state: { isStandardRegistration: false } });
    } else {
      // Si ya está registrado pero es free, va directo a pagar/suscribirse
      navigate('/subscribe');
    }
  };

  return (
    <div className="w-full bg-[#FDFBF7] rounded-[2rem] p-5 shadow-sm border border-orange-100/50 relative overflow-hidden flex items-center justify-between min-h-[140px]">
      {/* Contenido Izquierdo */}
      <div className="flex flex-col items-start gap-4 z-10 max-w-[55%] relative">
        <h2 className="text-xl font-bold leading-[1.1]">
          <span className="text-[#0F172A] block">Acceso ilimitado a</span>
          <span className="text-[#FA8A6B]">Identificador de IA</span>
        </h2>
        
        <Button 
          onClick={handleClaim}
          className="bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-full px-6 h-10 font-bold text-xs tracking-wider shadow-lg shadow-slate-900/20"
        >
          RECLAMAR
        </Button>
      </div>

      {/* Contenido Derecho (Imagen y Etiquetas) */}
      <div className="absolute right-0 top-0 bottom-0 w-[50%] h-full pointer-events-none">
         {/* Círculo de fondo sutil */}
         <div className="absolute right-[-20%] top-1/2 -translate-y-1/2 w-48 h-48 bg-orange-50 rounded-full" />
         
         {/* Imagen de comida */}
         <img 
            src="/recipes/oat-banana-peanut.png" 
            alt="Comida saludable" 
            className="absolute -right-6 top-1/2 -translate-y-1/2 w-40 h-40 object-cover object-center rounded-full shadow-md rotate-12"
         />
         
         {/* Etiqueta 1: Calorías */}
         <div className="absolute top-4 right-[60%] bg-white rounded-full pl-1.5 pr-2.5 py-1 flex items-center gap-1.5 shadow-sm border border-gray-100 z-20 whitespace-nowrap animate-in fade-in zoom-in duration-500 delay-100">
            <div className="bg-green-500 rounded-full p-0.5">
                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
            </div>
            <span className="text-[10px] font-bold text-slate-800 tracking-wide">CALORÍAS</span>
            {/* Línea conectora simulada */}
            <div className="absolute top-full left-1/2 h-4 w-px bg-white/80" />
         </div>

         {/* Etiqueta 2: Nutrición */}
         <div className="absolute bottom-6 right-[55%] bg-white rounded-full pl-1.5 pr-2.5 py-1 flex items-center gap-1.5 shadow-sm border border-gray-100 z-20 whitespace-nowrap animate-in fade-in zoom-in duration-500 delay-300">
            <div className="bg-green-500 rounded-full p-0.5">
                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
            </div>
            <span className="text-[10px] font-bold text-slate-800 tracking-wide">NUTRICIÓN</span>
         </div>
      </div>
    </div>
  );
};

export default GuestBanner;