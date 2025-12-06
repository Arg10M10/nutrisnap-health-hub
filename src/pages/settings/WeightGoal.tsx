import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Edit } from 'lucide-react';
import EditProfileDrawer from '@/components/EditProfileDrawer';
import EditGoalWeightDrawer from '@/components/EditGoalWeightDrawer';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import EditWeightDrawer from '@/components/EditWeightDrawer';

const InfoRow = ({ label, value, onEdit }: { label: string; value: string | number | null; onEdit: () => void }) => (
  <div className="flex items-center justify-between py-4">
    <p className="text-muted-foreground">{label}</p>
    <div className="flex items-center gap-4">
      <p className="font-semibold text-foreground">{value}</p>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
        <Edit className="w-4 h-4 text-muted-foreground" />
      </Button>
    </div>
  </div>
);

const WeightGoal = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile, user } = useAuth();
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isGoalDrawerOpen, setIsGoalDrawerOpen] = useState(false);
  const [isWeightDrawerOpen, setIsWeightDrawerOpen] = useState(false);

  const { data: lastWeightEntry } = useQuery({
    queryKey: ['last_weight_entry', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('weight_history')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleOpenWeightDrawer = () => {
    if (lastWeightEntry) {
      const lastEntryDate = new Date(lastWeightEntry.created_at);
      if (isToday(lastEntryDate)) {
        toast.info("Ya has actualizado tu peso hoy.", {
          description: "Puedes actualizar tu peso de nuevo mañana.",
        });
        return;
      }
    }
    setIsWeightDrawerOpen(true);
  };

  const formattedDob = profile?.date_of_birth 
    ? format(new Date(profile.date_of_birth), 'P', { locale: es })
    : '-';

  return (
    <PageLayout>
      <div className="space-y-8">
        <header className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">{t('settings.goals.editWeight')}</h1>
        </header>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">{t('weight_goal.title')}</p>
              <p className="text-2xl font-bold text-foreground">{profile?.goal_weight || '-'} kg</p>
            </div>
            <Button onClick={() => setIsGoalDrawerOpen(true)}>{t('weight_goal.change_button')}</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 divide-y">
            <InfoRow label={t('weight_goal.current_weight')} value={`${profile?.weight || '-'} kg`} onEdit={handleOpenWeightDrawer} />
            <InfoRow label={t('weight_goal.height')} value={`${profile?.height || '-'} cm`} onEdit={() => setIsEditDrawerOpen(true)} />
            <InfoRow label={t('weight_goal.dob')} value={formattedDob} onEdit={() => setIsEditDrawerOpen(true)} />
            <InfoRow label={t('weight_goal.gender')} value={profile?.gender || '-'} onEdit={() => setIsEditDrawerOpen(true)} />
          </CardContent>
        </Card>
      </div>
      <EditProfileDrawer isOpen={isEditDrawerOpen} onClose={() => setIsEditDrawerOpen(false)} />
      <EditGoalWeightDrawer 
        isOpen={isGoalDrawerOpen} 
        onClose={() => setIsGoalDrawerOpen(false)} 
        currentGoalWeight={profile?.goal_weight || 70}
      />
      <EditWeightDrawer 
        isOpen={isWeightDrawerOpen} 
        onClose={() => setIsWeightDrawerOpen(false)} 
        currentWeight={profile?.weight || 70}
      />
    </PageLayout>
  );
};

export default WeightGoal;