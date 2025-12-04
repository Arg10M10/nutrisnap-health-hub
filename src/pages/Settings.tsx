import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import {
  User, Edit, HeartPulse, SlidersHorizontal, Languages, Target, Goal, Palette,
  Lightbulb, Mail, FileText, Shield, Instagram, LogOut, Trash2
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import EditProfileDrawer from "@/components/EditProfileDrawer";
import PageLayout from "@/components/PageLayout";
import { SettingsCategory } from "@/components/settings/SettingsCategory";
import { SettingsItem } from "@/components/settings/SettingsItem";
import { LanguageDrawer } from "@/components/settings/LanguageDrawer";
import { TikTokIcon } from "@/components/icons/TikTokIcon";

const Settings = () => {
  const { profile, signOut } = useAuth();
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isLanguageDrawerOpen, setIsLanguageDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await signOut();
    toast.success(t('settings.signOutSuccess'));
  };

  const handleNotImplemented = () => {
    toast.info("Coming Soon", { description: "This feature will be available soon." });
  };

  const handleDeleteAccount = () => {
    // Placeholder for account deletion logic
    toast.error("Function not implemented.", {
      description: "Account deletion will be enabled in the future.",
    });
  };

  return (
    <PageLayout>
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-primary">{t('settings.title')}</h1>
          <p className="text-muted-foreground text-lg">
            {t('settings.subtitle')}
          </p>
        </div>

        {/* Profile Card */}
        <div className="p-6 bg-card border rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <User className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-bold text-lg text-foreground">{profile?.full_name || t('settings.profileCard.namePlaceholder')}</p>
              <p className="text-sm text-muted-foreground">{t('settings.profileCard.viewAndEdit')}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsEditDrawerOpen(true)}>
            <Edit className="w-5 h-5" />
          </Button>
        </div>

        {/* Account Category */}
        <SettingsCategory title={t('settings.account.title')}>
          <SettingsItem icon={<HeartPulse size={20} />} label={t('settings.account.personalDetails')} onClick={() => setIsEditDrawerOpen(true)} />
          <SettingsItem icon={<SlidersHorizontal size={20} />} label={t('settings.account.preferences')} onClick={() => navigate('/settings/preferences')} />
          <SettingsItem icon={<Languages size={20} />} label={t('settings.language')} onClick={() => setIsLanguageDrawerOpen(true)} />
        </SettingsCategory>

        {/* Goals and Tracking Category */}
        <SettingsCategory title={t('settings.goals.title')}>
          <SettingsItem icon={<Target size={20} />} label={t('settings.goals.editNutrition')} onClick={() => navigate('/settings/nutritional-goals')} />
          <SettingsItem icon={<Goal size={20} />} label={t('settings.goals.editWeight')} onClick={handleNotImplemented} />
          <SettingsItem icon={<Palette size={20} />} label={t('settings.goals.ringColors')} onClick={handleNotImplemented} />
        </SettingsCategory>

        {/* Support and Legal Category */}
        <SettingsCategory title={t('settings.support.title')}>
          <SettingsItem icon={<Lightbulb size={20} />} label={t('settings.support.requestFeature')} onClick={handleNotImplemented} />
          <SettingsItem icon={<Mail size={20} />} label={t('settings.support.supportEmail')} onClick={handleNotImplemented} />
          <SettingsItem icon={<FileText size={20} />} label={t('settings.support.terms')} onClick={handleNotImplemented} />
          <SettingsItem icon={<Shield size={20} />} label={t('settings.support.privacy')} onClick={handleNotImplemented} />
        </SettingsCategory>

        {/* Social Media Category */}
        <SettingsCategory title={t('settings.social.title')}>
          <SettingsItem icon={<Instagram size={20} />} label={t('settings.social.instagram')} onClick={handleNotImplemented} />
          <SettingsItem icon={<TikTokIcon />} label={t('settings.social.tiktok')} onClick={handleNotImplemented} />
        </SettingsCategory>

        {/* Account Actions Category */}
        <SettingsCategory title={t('settings.actions.title')}>
          <SettingsItem icon={<LogOut size={20} />} label={t('settings.actions.signOut')} onClick={handleSignOut} />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full">
                <SettingsItem icon={<Trash2 size={20} />} label={t('settings.actions.deleteAccount')} onClick={() => {}} destructive />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('settings.deleteDialog.title')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('settings.deleteDialog.description')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('settings.deleteDialog.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {t('settings.deleteDialog.confirm')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </SettingsCategory>

      </div>
      <EditProfileDrawer isOpen={isEditDrawerOpen} onClose={() => setIsEditDrawerOpen(false)} />
      <LanguageDrawer isOpen={isLanguageDrawerOpen} onClose={() => setIsLanguageDrawerOpen(false)} />
    </PageLayout>
  );
};

export default Settings;