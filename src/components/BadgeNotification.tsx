import { Award } from 'lucide-react';

interface BadgeNotificationProps {
  image: string;
  name: string;
  description: string;
}

const BadgeNotification = ({ image, name, description }: BadgeNotificationProps) => {
  return (
    <div className="flex items-center gap-4">
      <img src={image} alt={name} className="w-16 h-16" />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-400" />
          <p className="font-semibold text-foreground">¡Insignia Desbloqueada!</p>
        </div>
        <p className="font-bold text-lg text-primary">{name}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default BadgeNotification;