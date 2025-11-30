interface MacroProgressCircleProps {
  value: number;
  color: string;
  size?: 'large' | 'small';
}

const MacroProgressCircle = ({ value, color }: MacroProgressCircleProps) => {
  const cappedValue = Math.min(Math.max(value, 0), 100);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (cappedValue / 100) * circumference;

  return (
    <svg className="w-full h-full" viewBox="0 0 100 100">
      <circle
        stroke="hsl(var(--muted))"
        strokeWidth="10"
        fill="transparent"
        r={radius}
        cx="50"
        cy="50"
      />
      <circle
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        fill="transparent"
        r={radius}
        cx="50"
        cy="50"
        style={{
          strokeDasharray: circumference,
          strokeDashoffset: offset,
          transform: 'rotate(-90deg)',
          transformOrigin: '50% 50%',
          transition: 'stroke-dashoffset 0.3s ease-in-out',
        }}
      />
    </svg>
  );
};

export default MacroProgressCircle;