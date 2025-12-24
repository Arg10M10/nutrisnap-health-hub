import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import {
  User, Edit, HeartPulse, SlidersHorizontal, Languages, Target, Goal, Palette,
  Lightbulb, Mail, FileText, Shield, LogOut, Trash2, Loader2, ChevronRight, Bell
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PageLayout from "@/components/PageLayout";
import { SettingsCategory } from "@/components/settings/SettingsCategory";
import { SettingsItem } from "@/components/settings/SettingsItem";
import { LanguageDrawer } from "@/components/settings/LanguageDrawer";
import UserAvatar from "@/components/UserAvatar";

const TERMS_URL = "https://www.calorel.online/termsandconditions";
const PRIVACY_URL = "https://www.calorel.online/privacypolicy";
const INSTAGRAM_URL = "https://www.instagram.com/calorel.app/";
const SUPPORT_EMAIL = "calorel.help@gmail.com";
const TIKTOK_URL = "https://www.tiktok.com/@calorel.app?_r=1&_t=ZS-920XYSQSag5";

const Settings = () => {
  const { profile, signOut } = useAuth();
  const [isLanguageDrawerOpen, setIsLanguageDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await signOut();
  };

  const openExternal = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const openGmailCompose = () => {
    const to = encodeURIComponent(SUPPORT_EMAIL);
    const schemes = [
      `googlegmail://co?to=${to}`,
      `gmail://co?to=${to}`,
    ];

    const tryOpenScheme = (url: string) => {
      const a = document.createElement('a');
      a.href = url;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      a.remove();
    };

    try {
      tryOpenScheme(schemes[0]);
    } catch (e) {
      try {
        tryOpenScheme(schemes[1]);
      } catch (e2) {
        // fallback
      }
    }

    setTimeout(() => {
      window.location.href = `mailto:${SUPPORT_EMAIL}`;
    }, 700);
  };

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.functions.invoke('delete-user');
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success(t('toasts.delete_success_title'), {
        description: t('toasts.delete_success_desc'),
      });
      signOut();
    },
    onError: (error: Error) => {
      toast.error(t('toasts.delete_error_title'), {
        description: error.message,
      });
    },
  });

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate();
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
        <button
          onClick={() => navigate('/settings/edit-profile')}
          className="w-full p-6 bg-card border rounded-2xl flex items-center justify-between text-left transition-colors hover:bg-muted/50"
        >
          <div className="flex items-center gap-4">
            <UserAvatar name={profile?.full_name} color={profile?.avatar_color} className="w-12 h-12 text-2xl" />
            <div>
              <p className="font-bold text-lg text-foreground">{profile?.full_name || t('settings.profileCard.namePlaceholder')}</p>
              <p className="text-sm text-muted-foreground">{t('settings.profileCard.viewAndEdit')}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Account Category */}
        <SettingsCategory title={t('settings.account.title')}>
          <SettingsItem icon={<HeartPulse size={20} />} label={t('settings.account.personalDetails')} onClick={() => navigate('/settings/personal-details')} />
          <SettingsItem icon={<SlidersHorizontal size={20} />} label={t('settings.account.preferences')} onClick={() => navigate('/settings/preferences')} />
          <SettingsItem icon={<Bell size={20} />} label="Recordatorios" onClick={() => navigate('/settings/reminders')} />
          <SettingsItem icon={<Languages size={20} />} label={t('settings.language')} onClick={() => setIsLanguageDrawerOpen(true)} />
        </SettingsCategory>

        {/* Goals and Tracking Category */}
        <SettingsCategory title={t('settings.goals.title')}>
          <SettingsItem icon={<Target size={20} />} label={t('settings.goals.editNutrition')} onClick={() => navigate('/settings/nutritional-goals')} />
          <SettingsItem icon={<Goal size={20} />} label={t('settings.goals.editWeight')} onClick={() => navigate('/settings/weight-goal')} />
          <SettingsItem icon={<Palette size={20} />} label={t('settings.goals.ringColors')} onClick={() => navigate('/settings/ring-colors')} />
        </SettingsCategory>

        {/* Support and Legal Category */}
        <SettingsCategory title={t('settings.support.title')}>
          <SettingsItem icon={<Lightbulb size={20} />} label={t('settings.support.requestFeature')} onClick={() => navigate('/settings/request-feature')} />
          <SettingsItem icon={<Mail size={20} />} label={t('settings.support.supportEmail')} onClick={openGmailCompose} />
          <SettingsItem icon={<FileText size={20} />} label={t('settings.support.terms')} onClick={() => openExternal(TERMS_URL)} />
          <SettingsItem icon={<Shield size={20} />} label={t('settings.support.privacy')} onClick={() => openExternal(PRIVACY_URL)} />
        </SettingsCategory>

        {/* Social Media Category */}
        <SettingsCategory title={t('settings.social.title')}>
          <SettingsItem 
            icon={<img src="/instagram-logo.png" alt="Instagram" className="w-5 h-5 object-contain" />} 
            label={t('settings.social.instagram')} 
            onClick={() => openExternal(INSTAGRAM_URL)} 
          />
          <SettingsItem 
            icon={<img src="/tiktok-logo.png" alt="TikTok" className="w-5 h-5 object-contain" />} 
            label={t('settings.social.tiktok')} 
            onClick={() => openExternal(TIKTOK_URL)} 
          />
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
                <AlertDialogAction onClick={handleDeleteAccount} disabled={deleteAccountMutation.isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {deleteAccountMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('settings.deleteDialog.confirm')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </SettingsCategory>

      </div>
      <LanguageDrawer isOpen={isLanguageDrawerOpen} onClose={() => setIsLanguageDrawerOpen(false)} />
    </PageLayout>
  );
};

export default Settings;