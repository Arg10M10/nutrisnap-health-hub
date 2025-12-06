import { motion, AnimatePresence } from 'framer-motion';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface BadgeUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge: {
    name: string;
    description: string;
    image: string;
  } | null;
}

const BadgeUnlockModal = ({ isOpen, onClose, badge }: BadgeUnlockModalProps) => {
  const { t } = useTranslation();

  const handleShare = async () => {
    if (!badge) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('badges.notification_title'),
          text: `¡Acabo de desbloquear la insignia "${badge.name}" en Calorel! ${badge.description}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      alert('Tu navegador no soporta la función de compartir nativa.');
    }
  };

  if (!badge) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 100 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: 0,
              transition: { type: "spring", stiffness: 300, damping: 25 } 
            }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            className="relative z-10 w-full max-w-sm mx-4"
          >
            <div className="bg-gradient-to-b from-background/90 to-background border border-white/20 rounded-3xl p-8 text-center shadow-2xl overflow-hidden relative">
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />

              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 15 }}
                className="relative mb-6 mx-auto w-40 h-40"
              >
                <img 
                  src={badge.image} 
                  alt={badge.name} 
                  className="w-full h-full object-contain animate-badge-glow" 
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
                  {t('badges.notification_title')}
                </h2>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {badge.name}
                </h3>
                <p className="text-muted-foreground mb-8">
                  {badge.description}
                </p>

                <div className="flex flex-col gap-3">
                  <Button 
                    size="lg" 
                    className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl"
                    onClick={handleShare}
                  >
                    <Share2 className="mr-2 w-5 h-5" /> Compartir Logro
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="lg"
                    className="w-full h-12 rounded-xl text-muted-foreground hover:text-foreground"
                    onClick={onClose}
                  >
                    Cerrar
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BadgeUnlockModal;