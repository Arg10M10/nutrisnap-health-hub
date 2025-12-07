import { useState, useEffect, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import WheelPicker from '../WheelPicker';
import ImperialHeightPicker from '../ImperialHeightPicker';

interface EditHeightDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentHeight: number;
}

const EditHeightDrawer = ({ isOpen, onClose, currentHeight }: EditHeightDrawerProps) => {
  const [newHeight, setNewHeight] = useState(currentHeight);
  const { user, profile, refetchProfile } = useAuth();
  const { t } = useTranslation();
  const isMetric = profile?.units !== 'imperial';
  const heightItems = useMemo(() => Array.from({ length: 250 - 100 + 1 }, (_, i) => i + 100), []);

  useEffect(() => {
    if (isOpen) {
      setNewHeight(currentHeight);
    }
  }, [isOpen, currentHeight]);

  const mutation = useMutation({
    mutationFn: async (height: number) => {
      if (!user) throw new Error('User not found.');
      const { error } = await supabase.from('profiles').update({ height }).eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await refetchProfile();
      onClose();
    },
    onError: (error) => {
      toast.error('Error', { description: error.message });
    },
  });

  const handleSave = () => {
    mutation.mutate(newHeight);
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center">{t('edit_profile.height')}</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 py-8 flex flex-col items-center gap-4">
          {isMetric ? (
            <div className="flex items-center justify-center">
              <WheelPicker
                items={heightItems}
                value={newHeight}
                onValueChange={setNewHeight}
                className="w-24"
              />
              <span className="text-lg text-muted-foreground font-semibold ml-2">cm</span>
            </div>
          ) : (
            <ImperialHeightPicker value={newHeight} onValueChange={setNewHeight} className="w-32" />
          )}
        </div>
        <DrawerFooter>
          <Button size="lg" onClick={handleSave} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('edit_profile.save')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default EditHeightDrawer;