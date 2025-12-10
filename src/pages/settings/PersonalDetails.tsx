import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Edit } from 'lucide-react';
import EditAgeDrawer from '@/components/settings/EditAgeDrawer';
import EditHeightDrawer from '@/components/settings/EditHeightDrawer';
import EditWeightDrawer from '@/components/EditWeightDrawer';
import EditSelectDetailDrawer from '@/components/settings/EditSelectDetailDrawer';

const InfoRow = ({ label, value, onEdit }: { label: string; value: string | number | null; onEdit: () => void; }) => (
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

const PersonalDetails = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile } = useAuth();
  
  const [isAgeDrawerOpen, setIsAgeDrawerOpen] = useState(false);
  const [isHeightDrawerOpen, setIsHeightDrawerOpen] = useState(false);
  const [isWeightDrawerOpen, setIsWeightDrawerOpen] = useState(false);
  const [editingField, setEditingField] = useState<null | 'gender' | 'goal' | 'experience'>(null);

  const isMetric = profile?.units !== 'imperial';
  const heightUnit = isMetric ? 'cm' : '"';
  const weightUnit = isMetric ? 'kg' : 'lbs';

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

  const goalOptions = [
    { value: 'lose_weight', label: t('edit_profile.goal_lose') },
    { value: 'maintain_weight', label: t('edit_profile.goal_maintain') },
    { value: 'gain_weight', label: t('edit_profile.goal_gain') },
  ];

  const experienceOptions = [
    { value: "Yes, I've used several", label: t('edit_profile.experience_several') },
    { value: "Yes, one or two", label: t('edit_profile.experience_one_or_two') },
    { value: "No, this is my first time", label: t('edit_profile.experience_first_time') },
  ];

  return (
    <PageLayout>
      <div className="space-y-8">
        <header className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">{t('settings.account.personalDetails')}</h1>
        </header>

        <Card>
          <CardContent className="p-4 divide-y">
            <InfoRow label={t('edit_profile.age')} value={`${profile?.age || '-'} ${t('edit_profile.years_unit')}`} onEdit={() => setIsAgeDrawerOpen(true)} />
            <InfoRow label={t('edit_profile.height')} value={formatHeight(profile?.height)} onEdit={() => setIsHeightDrawerOpen(true)} />
            <InfoRow label={t('edit_profile.weight')} value={`${profile?.weight || '-'} ${weightUnit}`} onEdit={() => setIsWeightDrawerOpen(true)} />
            <InfoRow label={t('edit_profile.gender')} value={t(getTranslationKey('edit_profile.gender', profile?.gender), { defaultValue: profile?.gender || '-' })} onEdit={() => setEditingField('gender')} />
            <InfoRow label={t('edit_profile.goal')} value={t(getTranslationKey('edit_profile.goal', profile?.goal), { defaultValue: profile?.goal || '-' })} onEdit={() => setEditingField('goal')} />
            <InfoRow label={t('edit_profile.experience')} value={t(getTranslationKey('edit_profile.experience', profile?.previous_apps_experience), { defaultValue: profile?.previous_apps_experience || '-' })} onEdit={() => setEditingField('experience')} />
          </CardContent>
        </Card>
      </div>
      
      <EditAgeDrawer isOpen={isAgeDrawerOpen} onClose={() => setIsAgeDrawerOpen(false)} currentAge={profile?.age || 18} />
      <EditHeightDrawer isOpen={isHeightDrawerOpen} onClose={() => setIsHeightDrawerOpen(false)} currentHeight={profile?.height || (isMetric ? 170 : 67)} />
      <EditWeightDrawer isOpen={isWeightDrawerOpen} onClose={() => setIsWeightDrawerOpen(false)} currentWeight={profile?.weight || (isMetric ? 70 : 154)} />
      
      <EditSelectDetailDrawer
        isOpen={editingField === 'gender'}
        onClose={() => setEditingField(null)}
        title={t('edit_profile.gender')}
        currentValue={profile?.gender || null}
        options={genderOptions}
        profileField="gender"
      />
      <EditSelectDetailDrawer
        isOpen={editingField === 'goal'}
        onClose={() => setEditingField(null)}
        title={t('edit_profile.goal')}
        currentValue={profile?.goal || null}
        options={goalOptions}
        profileField="goal"
      />
      <EditSelectDetailDrawer
        isOpen={editingField === 'experience'}
        onClose={() => setEditingField(null)}
        title={t('edit_profile.experience')}
        currentValue={profile?.previous_apps_experience || null}
        options={experienceOptions}
        profileField="previous_apps_experience"
      />
    </PageLayout>
  );
};

export default PersonalDetails;