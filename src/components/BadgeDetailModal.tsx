import { motion, AnimatePresence } from 'framer-motion';
import { Share2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface BadgeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge: {
    name: string;
    description: string;
    image: string;
  } | null;
}

const BadgeDetailModal = ({ isOpen, onClose, badge }: BadgeDetailModalProps) => {
  const { t } = useTranslation();

  const handleShare = async () => {
    if (!badge) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('badges.notification_title'),
          text: `¡Desbloqueé la insignia "${badge.name}" en Calorel! ${badge.description}`,
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: 0,
              transition: { type: "spring", stiffness: 400, damping: 30 } 
            }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            className="relative z-10 w-full max-w-sm"
          >
            <div className="bg-card rounded-3xl p-8 pt-12 text-center shadow-2xl overflow-hidden relative">
              <Button variant="ghost" size="icon" className="absolute top-3 right-3 rounded-full" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>

              <div className="relative mb-6 mx-auto w-40 h-40">
                <img 
                  src={badge.image} 
                  alt={badge.name} 
                  className="w-full h-full object-contain" 
                />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {badge.name}
                </h2>
                <p className="text-muted-foreground mb-8">
                  {badge.description}
                </p>

                <div className="flex flex-col gap-3">
                  <Button 
                    size="lg" 
                    className="w-full h-14 text-lg font-semibold"
                    onClick={handleShare}
                  >
                    <Share2 className="mr-2 w-5 h-5" /> Compartir
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BadgeDetailModal;