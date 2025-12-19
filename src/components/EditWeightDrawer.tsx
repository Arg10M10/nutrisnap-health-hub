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

interface EditWeightDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeight: number;
}

const EditWeightDrawer = ({ isOpen, onClose, currentWeight }: EditWeightDrawerProps) => {
  const [newWeight, setNewWeight] = useState(currentWeight);
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
      // Asegurar que el valor inicial tenga formato decimal string para coincidir con la lista
      setNewWeight(currentWeight);
    }
  }, [isOpen, currentWeight]);

  const mutation = useMutation({
    mutationFn: async (weight: number) => {
      if (!user) throw new Error('Usuario no encontrado.');

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ weight })
        .eq('id', user.id);
      if (profileError) throw profileError;

      const { error: historyError } = await supabase
        .from('weight_history')
        .insert({ user_id: user.id, weight });
      if (historyError) throw historyError;
    },
    onSuccess: async () => {
      await Promise.all([
        refetchProfile(),
        queryClient.invalidateQueries({ queryKey: ['weight_history_all', user?.id] }),
        queryClient.invalidateQueries({ queryKey: ['todays_weight_updates_count', user?.id] })
      ]);
      onClose();
    },
    onError: (error) => {
      toast.error('Error', { description: error.message });
    },
  });

  const handleSave = () => {
    mutation.mutate(newWeight);
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center">{t('edit_weight.title')}</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 py-8 flex flex-col items-center gap-4">
          <div className="flex items-center justify-center">
            <WheelPicker
              items={weightItems}
              value={newWeight.toFixed(1)} // Convertir número a string para el picker
              onValueChange={(val) => setNewWeight(parseFloat(val))} // Convertir string a número al guardar
              className="w-32"
            />
            <span className="text-2xl text-muted-foreground font-semibold ml-2">{isMetric ? t('edit_weight.weight_unit') : 'lbs'}</span>
          </div>
        </div>
        <DrawerFooter>
          <Button size="lg" onClick={handleSave} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('edit_weight.save')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default EditWeightDrawer;