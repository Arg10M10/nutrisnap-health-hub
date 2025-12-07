import { useEffect, useState } from 'react';
import WheelPicker from './WheelPicker';

interface FeetInchesPickerProps {
  value: number | null; // Total inches
  onValueChange: (value: number) => void;
}

const FeetInchesPicker = ({ value, onValueChange }: FeetInchesPickerProps) => {
  const totalInches = value ?? 67; // Default to 5'7"
  
  const [feet, setFeet] = useState(Math.floor(totalInches / 12));
  const [inches, setInches] = useState(totalInches % 12);

  // When feet or inches change, update the total inches value
  useEffect(() => {
    const newTotalInches = feet * 12 + inches;
    if (newTotalInches !== value) {
      onValueChange(newTotalInches);
    }
  }, [feet, inches]);

  // When the external value prop changes, update the internal feet/inches state
  useEffect(() => {
    if (value !== null) {
      const newFeet = Math.floor(value / 12);
      const newInches = value % 12;
      if (newFeet !== feet) {
        setFeet(newFeet);
      }
      if (newInches !== inches) {
        setInches(newInches);
      }
    }
  }, [value]);

  return (
    <div className="flex items-center justify-center gap-0">
      <WheelPicker
        min={4} // Min feet
        max={7} // Max feet
        value={feet}
        onValueChange={setFeet}
        className="w-20"
      />
      <span className="text-2xl font-semibold text-foreground -translate-y-1 mx-1">'</span>
      <WheelPicker
        min={0}
        max={11}
        value={inches}
        onValueChange={setInches}
        className="w-20"
      />
       <span className="text-2xl text-muted-foreground font-semibold ml-1">"</span>
    </div>
  );
};

export default FeetInchesPicker;