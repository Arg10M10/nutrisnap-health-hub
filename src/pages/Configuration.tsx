import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import {
  SlidersHorizontal, Languages, Lightbulb, Mail, FileText, Shield, LogOut, Trash2, Loader2, Bell, AlertTriangle, ArrowLeft, HeartPulse, Target, Goal, Palette, HelpCircle, LayoutDashboard, Plus, Check
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
  const { signOut, profile } = useAuth();
  const [isLanguageDrawerOpen, setIsLanguageDrawerOpen] = useState(false);
  const [isDeleteDrawerOpen, setIsDeleteDrawerOpen] = useState(false);
  const [isWidgetHelpOpen, setIsWidgetHelpOpen] = useState(false);
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

        {/* WIDGET PREVIEW SECTION */}
        <div className="bg-muted/30 rounded-2xl p-5 border border-border/50 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">{t('widgets.title')}</h3>
            <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded-md border">
              Claro / Oscuro
            </span>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-4 scrollbar-hide snap-x">
            
            {/* Widget 1: Calories (Medium 2x1) */}
            <div 
              className="snap-center shrink-0 w-[240px] bg-white dark:bg-zinc-900 rounded-[22px] p-4 text-zinc-900 dark:text-white shadow-md relative overflow-hidden cursor-pointer active:scale-95 transition-transform border border-zinc-200 dark:border-zinc-800"
              onClick={() => setIsWidgetHelpOpen(true)}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Calorías</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold">5</span>
                  <span className="text-xs">🔥</span>
                </div>
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold leading-none">1,450</span>
                  <span className="text-xs font-semibold text-muted-foreground">kcal</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-medium mb-2">/ 2,000</span>
                
                <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full w-[72%] bg-primary rounded-full" />
                </div>
              </div>
            </div>

            {/* Widget 2: Streak (Small 1x1) */}
            <div 
              className="snap-center shrink-0 w-[110px] h-[110px] bg-white dark:bg-zinc-900 rounded-[22px] p-3 text-zinc-900 dark:text-white shadow-md relative overflow-hidden cursor-pointer active:scale-95 transition-transform border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-1"
              onClick={() => setIsWidgetHelpOpen(true)}
            >
              <span className="text-2xl">🔥</span>
              <span className="text-3xl font-bold leading-none">5</span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Días</span>
            </div>

            {/* Widget 3: Water (Small 1x1) */}
            <div 
              className="snap-center shrink-0 w-[110px] h-[110px] bg-white dark:bg-zinc-900 rounded-[22px] p-3 text-zinc-900 dark:text-white shadow-md relative overflow-hidden cursor-pointer active:scale-95 transition-transform border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-1"
              onClick={() => setIsWidgetHelpOpen(true)}
            >
              <span className="text-2xl">💧</span>
              <span className="text-3xl font-bold leading-none">45</span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">OZ</span>
            </div>

          </div>
          
          <button 
            onClick={() => setIsWidgetHelpOpen(true)}
            className="w-full mt-2 flex items-center justify-center gap-2 text-sm text-primary font-bold hover:bg-primary/5 p-3 rounded-xl transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            {t('widgets.how_to_add')}
          </button>
        </div>

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
            disabled={profile?.is_guest}
          />
        </SettingsCategory>

      </div>
      <LanguageDrawer isOpen={isLanguageDrawerOpen} onClose={() => setIsLanguageDrawerOpen(false)} />
      
      {/* Widget Instructions Drawer */}
      <Drawer open={isWidgetHelpOpen} onOpenChange={setIsWidgetHelpOpen}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader className="text-center pt-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <LayoutDashboard className="w-8 h-8 text-primary" />
              </div>
              <DrawerTitle className="text-2xl font-bold text-foreground">{t('widgets.instructions_title')}</DrawerTitle>
            </DrawerHeader>
            
            <div className="px-6 pb-8 space-y-4">
              <div className="space-y-4">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex gap-4 items-start">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      {step}
                    </div>
                    <p className="text-sm font-medium leading-relaxed pt-0.5 text-muted-foreground">
                      {t(`widgets.step_${step}` as any)}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="bg-muted/50 p-3 rounded-xl flex items-center gap-3 border border-border/50">
                 <Check className="w-5 h-5 text-green-500" />
                 <p className="text-xs text-muted-foreground">El widget se adapta automáticamente al modo claro u oscuro de tu teléfono.</p>
              </div>

              <DrawerClose asChild>
                <Button size="lg" className="w-full mt-2 h-12 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20">
                  {t('common.understood')}
                </Button>
              </DrawerClose>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

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