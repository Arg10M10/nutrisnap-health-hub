import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface Option {
  value: string;
  label: string;
}

interface EditSelectDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  currentValue: string | null;
  options: Option[];
  profileField: 'gender' | 'goal' | 'previous_apps_experience';
}

const EditSelectDetailDrawer = ({ isOpen, onClose, title, currentValue, options, profileField }: EditSelectDetailDrawerProps) => {
  const [selectedValue, setSelectedValue] = useState(currentValue);
  const { user, refetchProfile } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen) {
      setSelectedValue(currentValue);
    }
  }, [isOpen, currentValue]);

  const mutation = useMutation({
    mutationFn: async (value: string) => {
      if (!user) throw new Error('User not found.');
      const { error } = await supabase.from('profiles').update({ [profileField]: value }).eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await refetchProfile();
      toast.success(t('edit_profile.toast_success'));
      onClose();
    },
    onError: (error) => {
      toast.error(t('edit_profile.toast_error'), { description: (error as Error).message });
    },
  });

  const handleSave = () => {
    if (selectedValue) {
      mutation.mutate(selectedValue);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center">{title}</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 py-8 flex flex-col items-center gap-4">
          <ToggleGroup
            type="single"
            variant="outline"
            className="w-full max-w-sm flex flex-col gap-2"
            value={selectedValue || undefined}
            onValueChange={(value) => { if (value) setSelectedValue(value) }}
          >
            {options.map(option => (
              <ToggleGroupItem 
                key={option.value} 
                value={option.value} 
                className="h-auto min-h-[3.5rem] text-base w-full justify-start p-4 whitespace-normal text-left"
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <DrawerFooter>
          <Button 
            size="lg" 
            onClick={handleSave} 
            disabled={mutation.isPending || !selectedValue}
            className="h-auto min-h-[3.5rem]"
          >
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('edit_profile.save')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default EditSelectDetailDrawer;