import { cn } from '@/lib/utils';

interface UserAvatarProps {
  name: string | null | undefined;
  color: string | null | undefined;
  className?: string;
}

const lightenColor = (hex: string, percent: number) => {
  if (!hex || hex.length < 7) return hex;
  hex = hex.replace(/^#/, '');
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  r = Math.min(255, r + (255 - r) * (percent / 100));
  g = Math.min(255, g + (255 - g) * (percent / 100));
  b = Math.min(255, b + (255 - b) * (percent / 100));
  const toHex = (c: number) => ('00' + Math.round(c).toString(16)).slice(-2);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const UserAvatar = ({ name, color, className }: UserAvatarProps) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  
  const baseColor = color || '#9CA3AF'; // gray-400
  const lighterColor = lightenColor(baseColor, 40);

  const style = {
    backgroundImage: `radial-gradient(circle at 70% 30%, ${lighterColor}, ${baseColor})`,
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full text-white font-bold',
        className
      )}
      style={style}
    >
      <span>{initial}</span>
    </div>
  );
};

export default UserAvatar;