import { useNavigate } from "react-router-dom";
import { Lock, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface HealthConnectPlaceholderProps {
  label: string;
}

export const HealthConnectPlaceholder = ({ label }: HealthConnectPlaceholderProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-4 text-center bg-muted/30 rounded-[2rem] border-2 border-dashed border-border/60">
      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
        <Lock className="w-6 h-6 text-muted-foreground opacity-70" />
      </div>
      
      <p className="text-sm font-semibold text-muted-foreground mb-1">{label}</p>
      <p className="text-xs text-muted-foreground/60 mb-3 max-w-[150px] leading-tight">
        {t('connect_apps.description').slice(0, 45)}...
      </p>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="h-8 text-xs rounded-full gap-2"
        onClick={(e) => {
          e.stopPropagation();
          navigate('/settings/connect-apps');
        }}
      >
        <Settings className="w-3 h-3" />
        {t('connect_apps.title')}
      </Button>
    </div>
  );
};