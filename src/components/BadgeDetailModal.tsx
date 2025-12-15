import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, X, Leaf, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { shareElement } from '@/lib/share';

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
  const shareRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (!badge || !shareRef.current) return;
    
    setIsSharing(true);
    try {
      await shareElement(
        shareRef.current, 
        `badge-${badge.name.replace(/\s+/g, '-').toLowerCase()}`,
        t('badges.notification_title'),
        t('share.badge_message', { name: badge.name })
      );
    } catch (error) {
      console.error('Error sharing badge:', error);
    } finally {
      setIsSharing(false);
    }
  };

  if (!badge) return null;

  return (
    <>
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
                      disabled={isSharing}
                    >
                      {isSharing ? <Loader2 className="mr-2 w-5 h-5 animate-spin"/> : <Share2 className="mr-2 w-5 h-5" />}
                      Compartir
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Plantilla oculta para compartir - Siempre renderizada cuando hay badge pero oculta fuera de pantalla */}
      <div 
        ref={shareRef}
        className="fixed top-0 w-[400px] bg-white p-8 flex flex-col items-center justify-center text-center gap-6 z-[-1]"
        style={{ left: '-9999px' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-green-600 p-2 rounded-full">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-green-700">Calorel</h1>
        </div>
        
        <div className="w-full h-px bg-gray-200" />

        <h2 className="text-xl font-medium text-gray-500 uppercase tracking-widest mt-2">{t('share.achievement_unlocked')}</h2>
        
        <img 
          src={badge.image} 
          alt={badge.name} 
          className="w-48 h-48 object-contain my-4 drop-shadow-xl" 
          crossOrigin="anonymous"
        />

        <div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">{badge.name}</h3>
          <p className="text-lg text-gray-600 px-4">{badge.description}</p>
        </div>

        <div className="mt-8 bg-gray-100 px-6 py-2 rounded-full">
          <p className="text-sm font-semibold text-gray-500">calorel.app</p>
        </div>
      </div>
    </>
  );
};

export default BadgeDetailModal;