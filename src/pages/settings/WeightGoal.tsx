import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format, isToday, startOfDay } from 'date-fns';
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
import EditWeightDrawer from '@/components/EditWeightDrawer';

const InfoRow = ({ label, value, onEdit, editDisabled, disabledText }: { label: string; value: string | number | null; onEdit: () => void; editDisabled?: boolean; disabledText?: string }) => (
  <div className="flex items-center justify-between py-4">
    <p className="text-muted-foreground">{label}</p>
    <div className="flex items-center gap-4">
      <p className="font-semibold text-foreground">{value}</p>
      {editDisabled ? (
        <span className="text-xs text-muted-foreground">{disabledText}</span>
      ) : (
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
          <Edit className="w-4 h-4 text-muted-foreground" />
        </Button>
      )}
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

  const { data: todaysWeightUpdatesCount } = useQuery({
    queryKey: ['todays_weight_updates_count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const todayStart = startOfDay(new Date()).toISOString();
      const { count, error } = await supabase
        .from('weight_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', todayStart);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user,
  });

  const hasReachedDailyWeightUpdateLimit = useMemo(() => {
    return (todaysWeightUpdatesCount ?? 0) >= 2;
  }, [todaysWeightUpdatesCount]);

  const handleOpenWeightDrawer = () => {
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
            <InfoRow 
              label={t('weight_goal.current_weight')} 
              value={`${profile?.weight || '-'} kg`} 
              onEdit={handleOpenWeightDrawer} 
              editDisabled={hasReachedDailyWeightUpdateLimit}
              disabledText={t('weight_goal.updated_today')}
            />
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