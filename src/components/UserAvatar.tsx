import { cn } from '@/lib/utils';

interface UserAvatarProps {
  name: string | null | undefined;
  color: string | null | undefined;
  className?: string;
}

const UserAvatar = ({ name, color, className }: UserAvatarProps) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  const style = { backgroundColor: color || '#9CA3AF' }; // gray-400

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full text-white font-bold',
        className
      )}
      style={style}
    >
      <span className="text-2xl">{initial}</span>
    </div>
  );
};

export default UserAvatar;