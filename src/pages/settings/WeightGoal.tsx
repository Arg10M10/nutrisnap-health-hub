import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { isToday, startOfDay } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Edit } from 'lucide-react';
import EditGoalWeightDrawer from '@/components/EditGoalWeightDrawer';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import EditWeightDrawer from '@/components/EditWeightDrawer';
import EditHeightDrawer from '@/components/settings/EditHeightDrawer';
import EditSelectDetailDrawer from '@/components/settings/EditSelectDetailDrawer';

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
  const [isGoalDrawerOpen, setIsGoalDrawerOpen] = useState(false);
  const [isWeightDrawerOpen, setIsWeightDrawerOpen] = useState(false);
  const [isHeightDrawerOpen, setIsHeightDrawerOpen] = useState(false);
  const [isGenderDrawerOpen, setIsGenderDrawerOpen] = useState(false);

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

  const isMetric = profile?.units !== 'imperial';
  const heightUnit = isMetric ? 'cm' : '"';

  const formatHeight = (height: number | null) => {
    if (height === null) return '-';
    if (isMetric) return `${height} ${heightUnit}`;
    const feet = Math.floor(height / 12);
    const inches = height % 12;
    return `${feet}' ${inches}${heightUnit}`;
  };

  const getTranslationKey = (prefix: string, value: string | null) => {
    if (!value) return prefix;
    const key = value.toLowerCase().replace(/, /g, '_').replace(/ /g, '_').replace(/'/g, '');
    return `${prefix}_${key}`;
  };

  const genderOptions = [
    { value: 'Female', label: t('edit_profile.gender_female') },
    { value: 'Male', label: t('edit_profile.gender_male') },
    { value: 'Prefer not to say', label: t('edit_profile.gender_not_say') },
  ];

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
            <InfoRow label={t('weight_goal.height')} value={formatHeight(profile?.height)} onEdit={() => setIsHeightDrawerOpen(true)} />
            <InfoRow label={t('weight_goal.gender')} value={t(getTranslationKey('edit_profile.gender', profile?.gender), { defaultValue: profile?.gender || '-' })} onEdit={() => setIsGenderDrawerOpen(true)} />
          </CardContent>
        </Card>
      </div>
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
      <EditHeightDrawer isOpen={isHeightDrawerOpen} onClose={() => setIsHeightDrawerOpen(false)} currentHeight={profile?.height || (isMetric ? 170 : 67)} />
      <EditSelectDetailDrawer
        isOpen={isGenderDrawerOpen}
        onClose={() => setIsGenderDrawerOpen(false)}
        title={t('edit_profile.gender')}
        currentValue={profile?.gender || null}
        options={genderOptions}
        profileField="gender"
      />
    </PageLayout>
  );
};

export default WeightGoal;