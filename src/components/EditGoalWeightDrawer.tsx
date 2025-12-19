import { useState, useEffect, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import WheelPicker from './WheelPicker';

interface EditGoalWeightDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoalWeight: number;
}

const EditGoalWeightDrawer = ({ isOpen, onClose, currentGoalWeight }: EditGoalWeightDrawerProps) => {
  const [newGoalWeight, setNewGoalWeight] = useState(currentGoalWeight);
  const { user, profile, refetchProfile } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const isMetric = profile?.units !== 'imperial';

  // Generar lista con decimales (e.g., 70.0, 70.1, 70.2...)
  const weightItems = useMemo(() => {
    const min = isMetric ? 30 : 66;
    const max = isMetric ? 200 : 440;
    const items: string[] = [];
    for (let i = min; i <= max; i += 0.1) {
      items.push(i.toFixed(1));
    }
    return items;
  }, [isMetric]);

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
        <div className="px-4 py-8 flex flex-col items-center gap-4">
          <div className="flex items-center justify-center">
            <WheelPicker
              items={weightItems}
              value={newGoalWeight.toFixed(1)} // Convertir número a string para el picker
              onValueChange={(val) => setNewGoalWeight(parseFloat(val))} // Convertir string a número al guardar
              className="w-32"
            />
            <span className="text-2xl text-muted-foreground font-semibold ml-2">{isMetric ? t('edit_goal_weight.weight_unit') : 'lbs'}</span>
          </div>
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