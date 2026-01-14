import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from '@tanstack/react-query';
import {
  SlidersHorizontal, Lightbulb, Mail, FileText, Shield, LogOut, Trash2, Loader2, Bell, AlertTriangle, ArrowLeft, HeartPulse, Target, Goal, Palette, HelpCircle, LayoutDashboard, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PageLayout from "@/components/PageLayout";
import { SettingsCategory } from "@/components/settings/SettingsCategory";
import { SettingsItem } from "@/components/settings/SettingsItem";
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
  const [isDeleteDrawerOpen, setIsDeleteDrawerOpen] = useState(false);
  const [isWidgetHelpOpen, setIsWidgetHelpOpen] = useState(false);
  const navigate = useNavigate();

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
      toast.success("Account Deleted", {
        description: "Your account and all associated data have been permanently deleted.",
      });
      signOut();
    },
    onError: (error: Error) => {
      toast.error("Failed to Delete", {
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
          <h1 className="text-2xl font-bold text-primary">Configuration</h1>
        </header>

        {/* Account Details Shortcut */}
        <SettingsCategory title="Account">
          <SettingsItem icon={<HeartPulse size={20} />} label="Personal Details" onClick={() => navigate('/settings/personal-details')} />
          <SettingsItem icon={<SlidersHorizontal size={20} />} label="Preferences" onClick={() => navigate('/settings/preferences')} />
          <SettingsItem icon={<Bell size={20} />} label="Reminders" onClick={() => navigate('/settings/reminders')} />
        </SettingsCategory>

        {/* WIDGET PREVIEW SECTION */}
        <div className="bg-muted/30 rounded-2xl p-5 border border-border/50 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Widgets</h3>
            <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded-md border">
              Preview
            </span>
          </div>
          
          {/* Contenedor de Widgets */}
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-4 scrollbar-hide snap-x items-center">
            
            {/* Widget 1: Calories (Medium 2x1) */}
            <div 
              className="snap-center shrink-0 w-[280px] h-[130px] bg-white dark:bg-zinc-900 rounded-[22px] p-4 text-zinc-900 dark:text-white shadow-md relative overflow-hidden cursor-pointer active:scale-95 transition-transform border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between"
              onClick={() => setIsWidgetHelpOpen(true)}
            >
              <div className="flex justify-between items-start">
                <span className="text-[12px] font-bold text-primary tracking-wide">Calorel</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-zinc-900 dark:text-white">5</span>
                  <span className="text-xs">🔥</span>
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center flex-1">
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-bold leading-none text-zinc-900 dark:text-white">1,450</span>
                  <span className="text-sm font-bold text-zinc-500 dark:text-zinc-400">kcal</span>
                </div>
                <span className="text-[12px] text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">/ 2,000</span>
                
                <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden mt-3">
                  <div className="h-full w-[72%] bg-primary rounded-full" />
                </div>
              </div>
            </div>

            {/* Widget 2: Streak (Small 1x1) */}
            <div 
              className="snap-center shrink-0 w-[130px] h-[130px] bg-white dark:bg-zinc-900 rounded-[22px] p-3 text-zinc-900 dark:text-white shadow-md relative overflow-hidden cursor-pointer active:scale-95 transition-transform border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-1"
              onClick={() => setIsWidgetHelpOpen(true)}
            >
              <span className="text-3xl mb-1">🔥</span>
              <span className="text-2xl font-bold leading-none text-zinc-900 dark:text-white">5</span>
              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">DAYS</span>
            </div>

            {/* Widget 3: Water (Small 1x1) */}
            <div 
              className="snap-center shrink-0 w-[130px] h-[130px] bg-white dark:bg-zinc-900 rounded-[22px] p-3 text-zinc-900 dark:text-white shadow-md relative overflow-hidden cursor-pointer active:scale-95 transition-transform border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-1"
              onClick={() => setIsWidgetHelpOpen(true)}
            >
              <span className="text-3xl mb-1">💧</span>
              <span className="text-2xl font-bold leading-none text-zinc-900 dark:text-white">45</span>
              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">OZ</span>
            </div>

          </div>
          
          <button 
            onClick={() => setIsWidgetHelpOpen(true)}
            className="w-full mt-2 flex items-center justify-center gap-2 text-sm text-primary font-bold hover:bg-primary/5 p-3 rounded-xl transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            How to add?
          </button>
        </div>

        {/* Goals and Tracking Category */}
        <SettingsCategory title="Goals & Tracking">
          <SettingsItem icon={<Target size={20} />} label="Nutritional Goals" onClick={() => navigate('/settings/nutritional-goals')} />
          <SettingsItem icon={<Goal size={20} />} label="Weight Goal" onClick={() => navigate('/settings/weight-goal')} />
          <SettingsItem icon={<Palette size={20} />} label="Ring Colors" onClick={() => navigate('/settings/ring-colors')} />
        </SettingsCategory>

        {/* Support and Legal Category */}
        <SettingsCategory title="Support & Legal">
          <SettingsItem icon={<Lightbulb size={20} />} label="Request a Feature" onClick={() => navigate('/settings/request-feature')} />
          <SettingsItem icon={<Mail size={20} />} label="Contact Support" onClick={openGmailCompose} />
          <SettingsItem icon={<FileText size={20} />} label="Terms of Service" onClick={() => openExternal(TERMS_URL)} />
          <SettingsItem icon={<Shield size={20} />} label="Privacy Policy" onClick={() => openExternal(PRIVACY_URL)} />
        </SettingsCategory>

        {/* Social Media Category */}
        <SettingsCategory title="Social Media">
          <SettingsItem 
            icon={<img src="/instagram-logo.png" alt="Instagram" className="w-5 h-5 object-contain" />} 
            label="Instagram" 
            onClick={() => openExternal(INSTAGRAM_URL)} 
          />
          <SettingsItem 
            icon={<img src="/tiktok-logo.png" alt="TikTok" className="w-5 h-5 object-contain" />} 
            label="TikTok" 
            onClick={() => openExternal(TIKTOK_URL)} 
          />
        </SettingsCategory>

        {/* Account Actions Category */}
        <SettingsCategory title="Actions">
          <SettingsItem icon={<LogOut size={20} />} label="Sign Out" onClick={handleSignOut} />
          <SettingsItem 
            icon={<Trash2 size={20} />} 
            label="Delete Account" 
            onClick={() => setIsDeleteDrawerOpen(true)} 
            destructive 
            disabled={profile?.is_guest}
          />
        </SettingsCategory>

      </div>
      
      {/* Widget Instructions Drawer */}
      <Drawer open={isWidgetHelpOpen} onOpenChange={setIsWidgetHelpOpen}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader className="text-center pt-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <LayoutDashboard className="w-8 h-8 text-primary" />
              </div>
              <DrawerTitle className="text-2xl font-bold text-foreground">Add Widget to Home</DrawerTitle>
            </DrawerHeader>
            
            <div className="px-6 pb-8 space-y-4">
              <div className="space-y-4">
                {[1, 2, 3, 4].map((step) => {
                  const stepText = [
                    "Go to your phone's home screen.",
                    "Long press on an empty space.",
                    "Select 'Widgets'.",
                    "Search for 'Calorel' and drag the widget."
                  ][step - 1];
                  return (
                    <div key={step} className="flex gap-4 items-start">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                        {step}
                      </div>
                      <p className="text-sm font-medium leading-relaxed pt-0.5 text-muted-foreground">
                        {stepText}
                      </p>
                    </div>
                  );
                })}
              </div>
              
              <div className="bg-muted/50 p-3 rounded-xl flex items-center gap-3 border border-border/50">
                 <Check className="w-5 h-5 text-green-500" />
                 <p className="text-xs text-muted-foreground">The widget automatically adapts to your phone's light or dark mode.</p>
              </div>

              <DrawerClose asChild>
                <Button size="lg" className="w-full mt-2 h-12 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20">
                  Understood
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
              <DrawerTitle className="text-2xl font-bold text-foreground">Are you absolutely sure?</DrawerTitle>
              <DrawerDescription className="text-base mt-2 text-muted-foreground">
                This action cannot be undone. This will permanently delete your account and remove your data from our servers.
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
                Delete Account
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" size="lg" className="w-full h-14 text-lg font-semibold rounded-2xl">
                  Cancel
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