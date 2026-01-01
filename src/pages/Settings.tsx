import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import {
  HeartPulse, Target, Goal, Palette, Settings as SettingsIcon, Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import PageLayout from "@/components/PageLayout";
import { SettingsCategory } from "@/components/settings/SettingsCategory";
import { SettingsItem } from "@/components/settings/SettingsItem";
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
          <Button variant="ghost" size="icon" onClick={() => navigate('/configuration')} className="rounded-full">
            <SettingsIcon className="w-6 h-6 text-foreground" />
          </Button>
        </div>

        {/* Profile Card / Header */}
        <div className="flex flex-col items-center gap-4 py-4">
          <UserAvatar name={profile?.full_name} color={profile?.avatar_color} className="w-24 h-24 text-4xl shadow-lg" />
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">{profile?.full_name || t('settings.profileCard.namePlaceholder')}</h2>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 rounded-full h-8"
              onClick={() => navigate('/settings/edit-profile')}
            >
              <Edit className="w-3 h-3 mr-2" />
              {t('settings.profileCard.viewAndEdit')}
            </Button>
          </div>
        </div>

        {/* Account Details Shortcut */}
        <SettingsCategory title={t('settings.account.title')}>
          <SettingsItem icon={<HeartPulse size={20} />} label={t('settings.account.personalDetails')} onClick={() => navigate('/settings/personal-details')} />
        </SettingsCategory>

        {/* Goals and Tracking Category */}
        <SettingsCategory title={t('settings.goals.title')}>
          <SettingsItem icon={<Target size={20} />} label={t('settings.goals.editNutrition')} onClick={() => navigate('/settings/nutritional-goals')} />
          <SettingsItem icon={<Goal size={20} />} label={t('settings.goals.editWeight')} onClick={() => navigate('/settings/weight-goal')} />
          <SettingsItem icon={<Palette size={20} />} label={t('settings.goals.ringColors')} onClick={() => navigate('/settings/ring-colors')} />
        </SettingsCategory>

      </div>
    </PageLayout>
  );
};

export default Settings;