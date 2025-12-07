import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Loader2 } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';

interface EditGoalWeightDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoalWeight: number;
}

const EditGoalWeightDrawer = ({ isOpen, onClose, currentGoalWeight }: EditGoalWeightDrawerProps) => {
  const [newGoalWeight, setNewGoalWeight] = useState(currentGoalWeight);
  const { user, refetchProfile } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen) {
      setNewGoalWeight(currentGoalWeight);
    }
  }, [isOpen, currentGoalWeight]);

  const mutation = useMutation({
    mutationFn: async (weight: number) => {
      if (!user) throw new Error('Usuario no encontrado.');

      const { error } = await supabase
        .from('profiles')
        .update({ goal_weight: weight })
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await refetchProfile();
      queryClient.invalidateQueries({ queryKey: ['profiles', user?.id] });
      onClose();
    },
    onError: (error) => {
      toast.error('No se pudo actualizar el peso objetivo.', { description: error.message });
    },
  });

  const handleSave = () => {
    mutation.mutate(newGoalWeight);
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center">{t('edit_goal_weight.title')}</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 py-8 space-y-8">
          <div className="text-center">
            <p className="text-6xl font-bold text-foreground">
              <AnimatedNumber value={newGoalWeight} toFixed={1} />
            </p>
            <p className="text-muted-foreground">{t('edit_goal_weight.weight_unit')}</p>
          </div>
          <Slider
            value={[newGoalWeight]}
            onValueChange={(vals) => setNewGoalWeight(vals[0])}
            min={30}
            max={200}
            step={0.5}
          />
        </div>
        <DrawerFooter>
          <Button size="lg" onClick={handleSave} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('edit_goal_weight.save')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default EditGoalWeightDrawer;