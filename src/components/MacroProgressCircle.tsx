import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface MacroProgressCircleProps {
  value: number;
  color: string;
  size?: 'large' | 'small';
}

const MacroProgressCircle = ({ value, color, size = 'small' }: MacroProgressCircleProps) => {
  const cappedValue = Math.min(Math.max(value, 0), 100);
  const data = [
    { name: 'value', value: cappedValue },
    { name: 'empty', value: 100 - cappedValue },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          dataKey="value"
          innerRadius={'70%'}
          outerRadius={'100%'}
          startAngle={90}
          endAngle={-270}
          paddingAngle={0}
          cornerRadius={50}
        >
          <Cell fill={color} stroke={color} />
          <Cell fill="hsl(var(--muted))" stroke="hsl(var(--muted))" />
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default MacroProgressCircle;