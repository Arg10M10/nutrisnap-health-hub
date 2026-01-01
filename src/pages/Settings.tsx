import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import PageLayout from "@/components/PageLayout";
import UserAvatar from "@/components/UserAvatar";

const Settings = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <PageLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-primary text-2xl font-bold">{t('settings.title')}</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/configuration')} 
            className="rounded-full w-12 h-12 bg-muted/50 hover:bg-muted"
          >
            <SettingsIcon className="w-7 h-7 text-foreground" />
          </Button>
        </div>

        {/* Profile Card / Header */}
        <div className="flex flex-col items-center gap-4 py-8">
          <UserAvatar name={profile?.full_name} color={profile?.avatar_color} className="w-32 h-32 text-6xl shadow-lg" />
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-foreground">{profile?.full_name || t('settings.profileCard.namePlaceholder')}</h2>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full h-9 px-6 text-sm font-medium border-2"
              onClick={() => navigate('/settings/edit-profile')}
            >
              <Edit className="w-4 h-4 mr-2" />
              {t('settings.profileCard.viewAndEdit')}
            </Button>
          </div>
        </div>

        {/* Placeholder para contenido futuro */}
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 opacity-50">
           <div className="w-full h-px bg-border max-w-[200px]" />
           <p className="text-sm text-muted-foreground">Tu historial y estadísticas aparecerán aquí pronto.</p>
        </div>

      </div>
    </PageLayout>
  );
};

export default Settings;