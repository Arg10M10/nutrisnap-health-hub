import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from 'react-i18next';

interface AgeStepProps {
  age: number | null;
  setAge: (age: number) => void;
}

export const AgeStep = ({ age, setAge }: AgeStepProps) => {
  const { t } = useTranslation();
  const ages = Array.from({ length: 88 }, (_, i) => i + 13); // Ages 13 to 100

  return (
    <div className="space-y-2">
      <Select
        value={age ? String(age) : ''}
        onValueChange={(value) => setAge(Number(value))}
      >
        <SelectTrigger className="w-full h-14 text-lg">
          <SelectValue placeholder={t('onboarding.age.label')} />
        </SelectTrigger>
        <SelectContent>
          {ages.map((a) => (
            <SelectItem key={a} value={String(a)}>
              {a} {t('onboarding.age.unit')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};