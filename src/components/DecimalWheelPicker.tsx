import { useEffect, useState } from 'react';
import WheelPicker from './WheelPicker';

interface DecimalWheelPickerProps {
  min: number;
  max: number;
  value: number | null;
  onValueChange: (value: number) => void;
  unit: string;
}

const DecimalWheelPicker = ({ min, max, value, onValueChange, unit }: DecimalWheelPickerProps) => {
  const initialValue = value ?? min;
  const [integerPart, setIntegerPart] = useState(Math.floor(initialValue));
  const [decimalPart, setDecimalPart] = useState(Math.round((initialValue % 1) * 10));

  useEffect(() => {
    const combinedValue = parseFloat(`${integerPart}.${decimalPart}`);
    if (combinedValue !== value) {
      onValueChange(combinedValue);
    }
  }, [integerPart, decimalPart]);

  useEffect(() => {
    if (value !== null) {
      const newIntegerPart = Math.floor(value);
      const newDecimalPart = Math.round((value % 1) * 10);
      if (newIntegerPart !== integerPart) {
        setIntegerPart(newIntegerPart);
      }
      if (newDecimalPart !== decimalPart) {
        setDecimalPart(newDecimalPart);
      }
    }
  }, [value]);

  return (
    <div className="flex items-center justify-center gap-1">
      <WheelPicker
        min={min}
        max={max}
        value={integerPart}
        onValueChange={setIntegerPart}
        className="w-24"
      />
      <span className="text-2xl font-semibold text-foreground -translate-y-1">.</span>
      <WheelPicker
        min={0}
        max={9}
        value={decimalPart}
        onValueChange={setDecimalPart}
        className="w-24"
      />
      <span className="text-2xl text-muted-foreground font-semibold ml-2">{unit}</span>
    </div>
  );
};

export default DecimalWheelPicker;