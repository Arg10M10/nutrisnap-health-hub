import { useTranslation } from 'react-i18next';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const languages = [
  { code: 'es', name: 'Español', flag: '/es-flag.png' },
  { code: 'en', name: 'Inglés', flag: '/us-flag.png' },
];

export const LanguageDrawer = ({ isOpen, onClose }: LanguageDrawerProps) => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle className="text-center">{t('language_drawer.title')}</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 pb-8 space-y-2">
          {languages.map((lang) => (
            <Button
              key={lang.code}
              variant="outline"
              size="lg"
              className={cn(
                'w-full h-14 text-lg justify-between p-6',
                i18n.language.startsWith(lang.code) && 'border-primary ring-2 ring-primary'
              )}
              onClick={() => changeLanguage(lang.code)}
            >
              <div className="flex items-center gap-4">
                <img src={lang.flag} alt={`${lang.name} flag`} className="w-8 h-6 rounded-sm object-cover" />
                <span>{t(`languages.${lang.code}` as any)}</span>
              </div>
              {i18n.language.startsWith(lang.code) && <Check className="w-5 h-5 text-primary" />}
            </Button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
};