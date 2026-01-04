import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';

const GuestBanner = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { t } = useTranslation();

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
    <div className="w-full bg-[#FDFBF7] rounded-[1.5rem] p-4 shadow-sm border border-border/40 relative overflow-hidden flex items-center justify-between min-h-[110px]">
      {/* Contenido Izquierdo */}
      <div className="flex flex-col items-start gap-3 z-10 max-w-[60%] relative">
        <h2 className="text-lg font-bold leading-tight">
          <span className="text-[#0F172A] block">{t('guest_banner.unlimited_access')}</span>
          <span className="text-primary">{t('guest_banner.ai_identifier')}</span>
        </h2>
        
        <Button 
          onClick={handleClaim}
          className="bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-full px-5 h-8 font-bold text-[10px] tracking-wider shadow-md"
        >
          {t('guest_banner.claim')}
        </Button>
      </div>

      {/* Contenido Derecho (Imagen y Etiquetas) */}
      <div className="absolute right-0 top-0 bottom-0 w-[45%] h-full pointer-events-none">
         {/* Círculo de fondo sutil */}
         <div className="absolute right-[-25%] top-1/2 -translate-y-1/2 w-40 h-40 bg-green-50 rounded-full" />
         
         {/* Imagen de comida */}
         <img 
            src="/recipes/oat-banana-peanut.png" 
            alt="Comida saludable" 
            className="absolute -right-4 top-1/2 -translate-y-1/2 w-32 h-32 object-cover object-center rounded-full shadow-md rotate-12"
         />
         
         {/* Etiqueta 1: Calorías - Movida más a la derecha */}
         <div className="absolute top-2 right-[20%] bg-white rounded-full pl-1.5 pr-2 py-0.5 flex items-center gap-1 shadow-sm border border-gray-100 z-20 whitespace-nowrap animate-in fade-in zoom-in duration-500 delay-100">
            <div className="bg-green-500 rounded-full p-0.5">
                <Check className="w-2 h-2 text-white" strokeWidth={3} />
            </div>
            <span className="text-[9px] font-bold text-slate-800 tracking-wide">{t('guest_banner.calories')}</span>
         </div>

         {/* Etiqueta 2: Nutrición - Movida más a la derecha */}
         <div className="absolute bottom-3 right-[45%] bg-white rounded-full pl-1.5 pr-2 py-0.5 flex items-center gap-1 shadow-sm border border-gray-100 z-20 whitespace-nowrap animate-in fade-in zoom-in duration-500 delay-300">
            <div className="bg-green-500 rounded-full p-0.5">
                <Check className="w-2 h-2 text-white" strokeWidth={3} />
            </div>
            <span className="text-[9px] font-bold text-slate-800 tracking-wide">{t('guest_banner.nutrition')}</span>
         </div>
      </div>
    </div>
  );
};

export default GuestBanner;