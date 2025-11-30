import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DobStepProps {
  dob: Date | null;
  setDob: (date: Date | null) => void;
}

export const DobStep = ({ dob, setDob }: DobStepProps) => {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      // HTML date input returns YYYY-MM-DD. We need to parse it correctly considering timezone.
      const [year, month, day] = e.target.value.split('-').map(Number);
      setDob(new Date(year, month - 1, day));
    } else {
      setDob(null);
    }
  };

  const dateToString = (date: Date | null) => {
    if (!date) return '';
    // Format to YYYY-MM-DD for the input value
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="dob" className="text-lg">Tu fecha de nacimiento</Label>
      <Input
        id="dob"
        type="date"
        value={dateToString(dob)}
        onChange={handleDateChange}
        className="h-14 text-lg"
        max={dateToString(new Date())} // Prevent selecting future dates
      />
    </div>
  );
};