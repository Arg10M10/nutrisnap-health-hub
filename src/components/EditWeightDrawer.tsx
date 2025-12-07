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
import useLocalStorage from '@/hooks/useLocalStorage';
import { weightLossBadges } from '@/data/badges';
import BadgeNotification from './BadgeNotification';
import AnimatedNumber from './AnimatedNumber';

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
      if (weightLost >= badge.kg && !unlockedBadges.includes(badge.id)) {
        const translatedBadge = {
          ...badge,
          name: t(`badge_names.${badge.id}.name` as any),
          description: t(`badge_names.${badge.id}.desc` as any),
        };

        toast.custom(() => (
          <div className="bg-card border p-4 rounded-lg shadow-lg w-full max-w-md">
            <BadgeNotification {...translatedBadge} />
          </div>
        ), { duration: 5000 });
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
      // We need to get the fresh profile data to check for badges
      const { data: updatedProfileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
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
        <div className="px-4 py-8 space-y-8">
          <div className="text-center">
            <p className="text-6xl font-bold text-foreground">
              <AnimatedNumber value={newWeight} toFixed={1} />
            </p>
            <p className="text-muted-foreground">{t('edit_weight.weight_unit')}</p>
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
            {t('edit_weight.save')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default EditWeightDrawer;