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

interface EditAgeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentAge: number;
}

const EditAgeDrawer = ({ isOpen, onClose, currentAge }: EditAgeDrawerProps) => {
  const [newAge, setNewAge] = useState(currentAge);
  const { user, refetchProfile } = useAuth();
  const { t } = useTranslation();
  const ageItems = useMemo(() => Array.from({ length: 100 - 13 + 1 }, (_, i) => i + 13), []);

  useEffect(() => {
    if (isOpen) {
      setNewAge(currentAge);
    }
  }, [isOpen, currentAge]);

  const mutation = useMutation({
    mutationFn: async (age: number) => {
      if (!user) throw new Error('User not found.');
      const { error } = await supabase.from('profiles').update({ age }).eq('id', user.id);
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
    mutation.mutate(newAge);
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center">{t('edit_profile.age')}</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 py-8 flex flex-col items-center gap-4">
          <div className="flex items-center justify-center">
            <WheelPicker
              items={ageItems}
              value={newAge}
              onValueChange={setNewAge}
              className="w-24"
            />
            <span className="text-2xl text-muted-foreground font-semibold ml-2">años</span>
          </div>
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

export default EditAgeDrawer;