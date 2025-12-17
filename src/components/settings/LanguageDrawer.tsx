import { useTranslation } from 'react-i18next';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Check, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const languages = [
  { code: 'es', name: 'Español', native: 'Spanish' },
  { code: 'en', name: 'English', native: 'Inglés' },
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
        <DrawerHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Globe className="w-6 h-6 text-primary" />
          </div>
          <DrawerTitle className="text-xl font-bold">{t('language_drawer.title')}</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 px-6 pb-8 space-y-3">
          {languages.map((lang) => {
            const isActive = i18n.language.startsWith(lang.code);
            return (
              <button
                key={lang.code}
                className={cn(
                  'w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200',
                  isActive 
                    ? 'border-primary bg-primary/5 shadow-sm' 
                    : 'border-muted hover:border-primary/30 bg-card'
                )}
                onClick={() => changeLanguage(lang.code)}
              >
                <div className="flex flex-col items-start">
                  <span className={cn("font-bold text-lg", isActive ? "text-primary" : "text-foreground")}>
                    {lang.name}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {lang.native}
                  </span>
                </div>
                {isActive && (
                  <div className="bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <DrawerFooter className="pt-0">
          <DrawerClose asChild>
            <Button variant="outline" size="lg" className="rounded-xl">{t('common.cancel')}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};