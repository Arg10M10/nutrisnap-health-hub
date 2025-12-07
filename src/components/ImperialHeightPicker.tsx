import { useMemo } from 'react';
import WheelPicker from './WheelPicker';

interface ImperialHeightPickerProps {
  value: number | null; // Total inches
  onValueChange: (value: number) => void;
  className?: string;
}

const generateHeightItems = () => {
  const items: string[] = [];
  for (let feet = 4; feet <= 7; feet++) {
    for (let inches = 0; inches < 12; inches++) {
      if (feet === 7 && inches > 0) break; // Max height 7'0"
      items.push(`${feet}' ${inches}"`);
    }
  }
  return items;
};

const inchesToString = (totalInches: number): string => {
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}' ${inches}"`;
};

const stringToInches = (heightString: string): number => {
  const parts = heightString.replace('"', '').split("' ");
  const feet = parseInt(parts[0], 10);
  const inches = parseInt(parts[1], 10);
  return feet * 12 + inches;
};

const ImperialHeightPicker = ({ value, onValueChange, className }: ImperialHeightPickerProps) => {
  const heightItems = useMemo(() => generateHeightItems(), []);
  
  const stringValue = value !== null ? inchesToString(value) : null;

  const handleValueChange = (newStringValue: string) => {
    onValueChange(stringToInches(newStringValue));
  };

  return (
    <WheelPicker
      items={heightItems}
      value={stringValue}
      onValueChange={handleValueChange}
      className={className}
    />
  );
};

export default ImperialHeightPicker;