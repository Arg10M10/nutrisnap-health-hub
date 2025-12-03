import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Loader2 } from 'lucide-react';

interface EditWeightDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeight: number;
}

const EditWeightDrawer = ({ isOpen, onClose, currentWeight }: EditWeightDrawerProps) => {
  const [newWeight, setNewWeight] = useState(currentWeight);
  const { user, refetchProfile } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) {
      setNewWeight(currentWeight);
    }
  }, [isOpen, currentWeight]);

  const mutation = useMutation({
    mutationFn: async (weight: number) => {
      if (!user) throw new Error('Usuario no encontrado.');

      // 1. Update the current weight in the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ weight })
        .eq('id', user.id);
      if (profileError) throw profileError;

      // 2. Add a new entry to the weight history
      const { error: historyError } = await supabase
        .from('weight_history')
        .insert({ user_id: user.id, weight });
      if (historyError) throw historyError;
    },
    onSuccess: async () => {
      toast.success('¡Peso actualizado con éxito!');
      await refetchProfile();
      queryClient.invalidateQueries({ queryKey: ['weight_history', user?.id] });
      onClose();
    },
    onError: (error) => {
      toast.error('No se pudo actualizar el peso.', { description: error.message });
    },
  });

  const handleSave = () => {
    mutation.mutate(newWeight);
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center">Actualizar Peso</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 py-8 space-y-8">
          <div className="text-center">
            <p className="text-6xl font-bold text-foreground">{newWeight.toFixed(1)}</p>
            <p className="text-muted-foreground">kg</p>
          </div>
          <Slider
            value={[newWeight]}
            onValueChange={(vals) => setNewWeight(vals[0])}
            min={30}
            max={200}
            step={0.1}
          />
        </div>
        <DrawerFooter>
          <Button size="lg" onClick={handleSave} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default EditWeightDrawer;