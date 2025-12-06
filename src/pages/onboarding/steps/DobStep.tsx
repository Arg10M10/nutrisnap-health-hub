import DatePicker from '@/components/DatePicker';
import { useTranslation } from 'react-i18next';

interface DobStepProps {
  dob: Date | null;
  setDob: (date: Date | null) => void;
}

export const DobStep = ({ dob, setDob }: DobStepProps) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <DatePicker
        value={dob}
        onChange={setDob}
        label={t('onboarding.dob.label')}
        placeholder={t('onboarding.dob.placeholder')}
      />
      <p className="text-sm text-muted-foreground">
        {t('onboarding.dob.disclaimer')}
      </p>
    </div>
  );
};