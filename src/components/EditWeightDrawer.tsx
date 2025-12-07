import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import useLocalStorage from '@/hooks/useLocalStorage';
import { weightLossBadges } from '@/data/badges';
import { useNutrition } from '@/context/NutritionContext';
import WheelPicker from './WheelPicker';

interface EditWeightDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeight: number;
}

const EditWeightDrawer = ({ isOpen, onClose, currentWeight }: EditWeightDrawerProps) => {
  const [newWeight, setNewWeight] = useState(Math.round(currentWeight));
  const { user, profile, refetchProfile } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [unlockedBadges, setUnlockedBadges] = useLocalStorage<string[]>('unlockedBadges', []);
  const { triggerBadgeUnlock } = useNutrition();

  useEffect(() => {
    if (isOpen) {
      setNewWeight(Math.round(currentWeight));
    }
  }, [isOpen, currentWeight]);

  const checkWeightBadges = (updatedProfile: typeof profile) => {
    if (updatedProfile?.goal !== 'lose_weight' || !updatedProfile.starting_weight || !updatedProfile.weight) return;

    const weightLost = updatedProfile.starting_weight - updatedProfile.weight;
    weightLossBadges.forEach(badge => {
      if (weightLost >= badge.kg && !unlockedBadges.includes(badge.id)) {
        const badgeInfo = {
          name: t(`badge_names.${badge.id}.name` as any),
          description: t(`badge_names.${badge.id}.desc` as any),
          image: badge.image,
        };
        
        triggerBadgeUnlock(badgeInfo);
        setUnlockedBadges(prev => [...prev, badge.id]);
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
      await Promise.all([
        refetchProfile(),
        queryClient.invalidateQueries({ queryKey: ['weight_history_all', user?.id] }),
        queryClient.invalidateQueries({ queryKey: ['todays_weight_updates_count', user?.id] })
      ]);
      const { data: updatedProfileData } = await supabase.from('profiles').select('*').eq('id', user!.id).single();
      if (updatedProfileData) {
        checkWeightBadges(updatedProfileData);
      }
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
              min={30}
              max={200}
              value={newWeight}
              onValueChange={setNewWeight}
              className="w-24"
            />
            <span className="text-2xl text-muted-foreground font-semibold ml-2">{t('edit_weight.weight_unit')}</span>
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