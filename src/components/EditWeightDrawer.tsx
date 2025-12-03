import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Loader2 } from 'lucide-react';
import useLocalStorage from '@/hooks/useLocalStorage';
import { weightLossBadges } from '@/data/badges';
import BadgeNotification from './BadgeNotification';
import NumberSwitch from './NumberSwitch';

interface EditWeightDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeight: number;
}

const EditWeightDrawer = ({ isOpen, onClose, currentWeight }: EditWeightDrawerProps) => {
  const [newWeight, setNewWeight] = useState(currentWeight);
  const { user, profile, refetchProfile } = useAuth();
  const queryClient = useQueryClient();
  const [unlockedBadges, setUnlockedBadges] = useLocalStorage<string[]>('unlockedBadges', []);

  useEffect(() => {
    if (isOpen) {
      setNewWeight(currentWeight);
    }
  }, [isOpen, currentWeight]);

  const checkWeightBadges = (updatedProfile: typeof profile) => {
    if (updatedProfile?.goal !== 'lose_weight' || !updatedProfile.starting_weight) return;

    const weightLost = updatedProfile.starting_weight - updatedProfile.weight;
    weightLossBadges.forEach(badge => {
      if (weightLost >= badge.kg && !unlockedBadges.includes(badge.name)) {
        toast.custom(() => (
          <div className="bg-card border p-4 rounded-lg shadow-lg w-full max-w-md">
            <BadgeNotification {...badge} />
          </div>
        ), { duration: 5000 });
        setUnlockedBadges(prev => [...prev, badge.name]);
      }
    });
  };

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
      toast.success('¡Peso actualizado con éxito!');
      await Promise.all([
        refetchProfile(),
        queryClient.invalidateQueries({ queryKey: ['weight_history', user?.id] })
      ]);
      // We need to get the fresh profile data to check for badges
      const { data: updatedProfileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (updatedProfileData) {
        checkWeightBadges(updatedProfileData);
      }
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
            <div className="text-6xl font-bold text-foreground">
              <NumberSwitch number={newWeight.toFixed(1)} />
            </div>
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