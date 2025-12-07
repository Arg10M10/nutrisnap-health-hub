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
import EditCategoricalDetailsDrawer from '@/components/settings/EditCategoricalDetailsDrawer';

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
  const [isCategoricalDrawerOpen, setIsCategoricalDrawerOpen] = useState(false);

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
            <InfoRow label={t('edit_profile.age')} value={`${profile?.age || '-'} años`} onEdit={() => setIsAgeDrawerOpen(true)} />
            <InfoRow label={t('edit_profile.height')} value={formatHeight(profile?.height)} onEdit={() => setIsHeightDrawerOpen(true)} />
            <InfoRow label={t('edit_profile.weight')} value={`${profile?.weight || '-'} ${weightUnit}`} onEdit={() => setIsWeightDrawerOpen(true)} />
            <InfoRow label={t('edit_profile.gender')} value={t(getTranslationKey('edit_profile.gender', profile?.gender), { defaultValue: profile?.gender || '-' })} onEdit={() => setIsCategoricalDrawerOpen(true)} />
            <InfoRow label={t('edit_profile.goal')} value={t(getTranslationKey('edit_profile.goal', profile?.goal), { defaultValue: profile?.goal || '-' })} onEdit={() => setIsCategoricalDrawerOpen(true)} />
            <InfoRow label={t('edit_profile.experience')} value={t(getTranslationKey('edit_profile.experience', profile?.previous_apps_experience), { defaultValue: profile?.previous_apps_experience || '-' })} onEdit={() => setIsCategoricalDrawerOpen(true)} />
          </CardContent>
        </Card>
      </div>
      
      <EditAgeDrawer isOpen={isAgeDrawerOpen} onClose={() => setIsAgeDrawerOpen(false)} currentAge={profile?.age || 18} />
      <EditHeightDrawer isOpen={isHeightDrawerOpen} onClose={() => setIsHeightDrawerOpen(false)} currentHeight={profile?.height || (isMetric ? 170 : 67)} />
      <EditWeightDrawer isOpen={isWeightDrawerOpen} onClose={() => setIsWeightDrawerOpen(false)} currentWeight={profile?.weight || (isMetric ? 70 : 154)} />
      <EditCategoricalDetailsDrawer isOpen={isCategoricalDrawerOpen} onClose={() => setIsCategoricalDrawerOpen(false)} />
    </PageLayout>
  );
};

export default PersonalDetails;