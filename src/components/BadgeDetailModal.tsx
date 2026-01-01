import { useRef, useState } from 'react';
import { Share2, Leaf, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { shareElement } from '@/lib/share';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

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
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="bg-card border-none shadow-2xl rounded-t-[32px]">
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader className="pt-8 pb-0">
               <div className="relative mb-6 mx-auto w-40 h-40">
                  <img 
                    src={badge.image} 
                    alt={badge.name} 
                    className="w-full h-full object-contain" 
                  />
                </div>
                <DrawerTitle className="text-2xl font-bold text-foreground mb-2 text-center">
                    {badge.name}
                </DrawerTitle>
            </DrawerHeader>
            
            <div className="px-8 text-center">
                <p className="text-muted-foreground mb-8">
                    {badge.description}
                </p>

                <div className="flex flex-col gap-3 pb-8">
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
        </DrawerContent>
      </Drawer>

      {/* Plantilla oculta para compartir */}
      <div 
        ref={shareRef}
        className="fixed top-0 w-[400px] bg-white p-8 flex flex-col items-center justify-center text-center gap-6 z-[-1]"
        style={{ left: '-9999px' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-green-600 p-2 rounded-full">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-normal text-green-700">Calorel</h1>
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