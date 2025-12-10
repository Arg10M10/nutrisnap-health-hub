import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ReactNode, useState, useEffect } from 'react';

interface GoalRowProps {
  icon: ReactNode;
  label: string;
  value: number;
  unit: string;
  onChange: (value: number) => void;
  color: string;
}

export const GoalRow = ({ icon, label, value, unit, onChange, color }: GoalRowProps) => {
  const [displayValue, setDisplayValue] = useState(String(value));

  useEffect(() => {
    // Sincroniza el valor de la UI con el estado del padre, pero solo si no están ya en sintonía.
    // Esto evita que se sobrescriba un campo vacío (que el usuario está editando) con un '0' del estado del padre.
    if (Number(displayValue) !== value) {
      setDisplayValue(String(value));
    }
  }, [value, displayValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Permite un string vacío o cualquier cadena de dígitos.
    if (val === '' || /^[0-9]+$/.test(val)) {
      setDisplayValue(val);
      // Notifica al padre del cambio numérico. Number('') se convierte en 0.
      onChange(Number(val));
    }
  };

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-4">
        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', color)}>
          {icon}
        </div>
        <div>
          <p className="font-semibold text-foreground">{label}</p>
          <p className="text-sm text-muted-foreground">{unit}</p>
        </div>
      </div>
      <Input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={displayValue}
        onChange={handleChange}
        className="w-24 text-center text-lg font-semibold h-12"
      />
    </div>
  );
};