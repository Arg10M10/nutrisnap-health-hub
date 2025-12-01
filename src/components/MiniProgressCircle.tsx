interface MiniProgressCircleProps {
  value: number;
  color: string;
  size: number;
}

const MiniProgressCircle = ({ value, color, size }: MiniProgressCircleProps) => {
  const cappedValue = Math.min(Math.max(value, 0), 100);
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (cappedValue / 100) * circumference;

  return (
    <svg className="w-full h-full" viewBox={`0 0 ${size} ${size}`}>
      <circle
        stroke="hsl(var(--muted))"
        strokeWidth={strokeWidth}
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
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

export default MiniProgressCircle;