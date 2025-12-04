import DatePicker from '@/components/DatePicker';

interface DobStepProps {
  dob: Date | null;
  setDob: (date: Date | null) => void;
}

export const DobStep = ({ dob, setDob }: DobStepProps) => {
  return (
    <div className="space-y-4">
      <DatePicker
        value={dob}
        onChange={setDob}
        label="Tu fecha de nacimiento"
        placeholder="Selecciona tu fecha de nacimiento"
      />
      <p className="text-sm text-muted-foreground">
        Usamos tu fecha de nacimiento para personalizar tus metas y verificar tu edad.
      </p>
    </div>
  );
};