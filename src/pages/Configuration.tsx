import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import {
  SlidersHorizontal, Languages, Lightbulb, Mail, FileText, Shield, LogOut, Trash2, Loader2, Bell, AlertTriangle, ArrowLeft, HeartPulse, Target, Goal, Palette
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PageLayout from "@/components/PageLayout";
import { SettingsCategory } from "@/components/settings/SettingsCategory";
import { SettingsItem } from "@/components/settings/SettingsItem";
import { LanguageDrawer } from "@/components/settings/LanguageDrawer";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerClose
} from "@/components/ui/drawer";

const TERMS_URL = "https://www.calorel.online/termsandconditions";
const PRIVACY_URL = "https://www.calorel.online/privacypolicy";
const INSTAGRAM_URL = "https://www.instagram.com/calorel.app/";
const SUPPORT_EMAIL = "calorel.help@gmail.com";
const TIKTOK_URL = "https://www.tiktok.com/@calorel.app?_r=1&_t=ZS-920XYSQSag5";

const Configuration = () => {
  const { signOut } = useAuth();
  const [isLanguageDrawerOpen, setIsLanguageDrawerOpen] = useState(false);
  const [isDeleteDrawerOpen, setIsDeleteDrawerOpen] = useState(false);
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
        <header className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">{t('settings.configuration_title')}</h1>
        </header>

        {/* Account Details Shortcut */}
        <SettingsCategory title={t('settings.account.title')}>
          <SettingsItem icon={<HeartPulse size={20} />} label={t('settings.account.personalDetails')} onClick={() => navigate('/settings/personal-details')} />
          <SettingsItem icon={<SlidersHorizontal size={20} />} label={t('settings.account.preferences')} onClick={() => navigate('/settings/preferences')} />
          <SettingsItem icon={<Bell size={20} />} label={t('settings.account.reminders')} onClick={() => navigate('/settings/reminders')} />
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
          <SettingsItem 
            icon={<Trash2 size={20} />} 
            label={t('settings.actions.deleteAccount')} 
            onClick={() => setIsDeleteDrawerOpen(true)} 
            destructive 
          />
        </SettingsCategory>

      </div>
      <LanguageDrawer isOpen={isLanguageDrawerOpen} onClose={() => setIsLanguageDrawerOpen(false)} />
      
      <Drawer open={isDeleteDrawerOpen} onOpenChange={setIsDeleteDrawerOpen}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader className="text-center pt-6">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-500" />
              </div>
              <DrawerTitle className="text-2xl font-bold text-foreground">{t('settings.deleteDialog.title')}</DrawerTitle>
              <DrawerDescription className="text-base mt-2 text-muted-foreground">
                {t('settings.deleteDialog.description')}
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter className="gap-3 pb-8 px-6">
              <Button 
                onClick={handleDeleteAccount} 
                disabled={deleteAccountMutation.isPending} 
                variant="destructive" 
                size="lg" 
                className="w-full h-14 text-lg font-semibold rounded-2xl shadow-lg shadow-red-500/20"
              >
                {deleteAccountMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Trash2 className="mr-2 h-5 w-5" />}
                {t('settings.deleteDialog.confirm')}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" size="lg" className="w-full h-14 text-lg font-semibold rounded-2xl">
                  {t('settings.deleteDialog.cancel')}
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </PageLayout>
  );
};

export default Configuration;