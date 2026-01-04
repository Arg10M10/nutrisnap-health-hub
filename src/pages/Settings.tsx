import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon, ChevronRight, MessageSquareText, Crown, Clock, CalendarDays, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import PageLayout from "@/components/PageLayout";
import UserAvatar from "@/components/UserAvatar";
import { Card, CardContent } from "@/components/ui/card";
import AnimatedNumber from "@/components/AnimatedNumber";
import { differenceInDays, differenceInHours, addDays, parseISO, format } from "date-fns";
import { es } from "date-fns/locale";

const SUPPORT_EMAIL = "calorel.help@gmail.com";

const calculateBMI = (weight: number | null, height: number | null, units: string | null) => {
  if (!weight || !height || height === 0) return 0;
  
  let w = weight;
  let h = height;

  if (units === 'imperial') {
    w = weight * 0.453592;
    h = height * 2.54;
  }

  const heightInMeters = h / 100;
  const bmi = w / (heightInMeters * heightInMeters);
  return parseFloat(bmi.toFixed(1));
};

const Settings = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const isImperial = profile?.units === 'imperial';
  const weightUnit = isImperial ? 'lbs' : 'kg';
  
  const currentWeight = profile?.weight || 0;
  const goalWeight = profile?.goal_weight || 0;
  const bmi = calculateBMI(currentWeight, profile?.height || 0, profile?.units || 'metric');

  const goalCalories = profile?.goal_calories || 2000;
  const goalProtein = profile?.goal_protein || 0;
  const goalCarbs = profile?.goal_carbs || 0;
  const goalFats = profile?.goal_fats || 0;

  const totalCalFromMacros = (goalProtein * 4) + (goalCarbs * 4) + (goalFats * 9);
  const safeTotal = totalCalFromMacros > 0 ? totalCalFromMacros : 1;

  const proteinPct = Math.round(((goalProtein * 4) / safeTotal) * 100);
  const carbPct = Math.round(((goalCarbs * 4) / safeTotal) * 100);
  const fatPct = Math.round(((goalFats * 9) / safeTotal) * 100);

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
      }
    }

    setTimeout(() => {
      window.location.href = `mailto:${SUPPORT_EMAIL}`;
    }, 700);
  };

  const isGuest = profile?.is_guest;

  const handleProfileClick = () => {
    if (isGuest) {
      navigate('/register-premium', { state: { isStandardRegistration: true } });
    } else {
      navigate('/settings/edit-profile');
    }
  };

  // --- Lógica de Estado de Suscripción ---
  
  let subscriptionCard = null;
  const now = new Date();

  // 1. Verificar Prueba Gratuita (Titanium/Gris Oscuro)
  if (profile?.is_subscribed && profile.trial_start_date) {
    const startDate = parseISO(profile.trial_start_date);
    const endDate = addDays(startDate, 3);
    const hoursLeft = differenceInHours(endDate, now);

    if (hoursLeft > 0) {
      const daysLeft = Math.ceil(hoursLeft / 24);
      const remainingText = daysLeft === 1 ? `${hoursLeft}h restantes` : `${daysLeft} días restantes`;
      
      subscriptionCard = (
        <div className="bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-2xl p-4 text-white shadow-lg flex items-center justify-between border border-zinc-700/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8 blur-2xl"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="bg-white/10 p-2.5 rounded-full border border-white/10">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-white/90">Prueba Premium Activa</p>
              <p className="text-xs text-zinc-400 font-medium">{remainingText} de prueba</p>
            </div>
          </div>
          <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide border border-white/5">
            TITANIUM
          </div>
        </div>
      );
    }
  } 
  // 2. Verificar Suscripción Activa (Manual)
  else if (profile?.is_subscribed && profile.subscription_end_date) {
    const endDate = parseISO(profile.subscription_end_date);
    const daysLeft = differenceInDays(endDate, now);
    const isAnnual = profile.plan_type === 'annual';
    const planName = isAnnual ? "Plan Anual" : "Plan Mensual";
    
    // Estilos dinámicos
    const bgGradient = isAnnual 
      ? "from-amber-400 to-yellow-600 shadow-yellow-500/20" // Oro
      : "from-slate-300 to-slate-500 shadow-slate-400/20"; // Plata
    
    const iconColor = isAnnual ? "text-yellow-900" : "text-slate-900";
    const iconBg = isAnnual ? "bg-yellow-900/20" : "bg-slate-900/10";
    const textColor = isAnnual ? "text-yellow-50" : "text-white";
    
    if (daysLeft >= 0) {
      subscriptionCard = (
        <div className={`bg-gradient-to-br ${bgGradient} rounded-2xl p-4 text-white shadow-lg flex items-center justify-between border border-white/20 relative overflow-hidden`}>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-10 -mb-10 blur-3xl"></div>
          
          <div className="flex items-center gap-3 relative z-10">
            <div className={`${iconBg} p-2.5 rounded-full backdrop-blur-sm border border-white/20`}>
              {isAnnual ? <Crown className={`w-5 h-5 ${iconColor}`} /> : <CalendarDays className={`w-5 h-5 ${iconColor}`} />}
            </div>
            <div>
              <p className={`font-bold text-sm drop-shadow-sm`}>{planName}</p>
              <p className={`text-xs ${textColor} font-medium opacity-90`}>
                Renueva el {format(endDate, "d MMM yyyy", { locale: i18n.language === 'es' ? es : undefined })}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end relative z-10">
             <div className="text-2xl font-black leading-none drop-shadow-md">{daysLeft}</div>
             <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">Días</div>
          </div>
        </div>
      );
    }
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleProfileClick}>
            <UserAvatar 
              name={isGuest ? "?" : profile?.full_name} 
              color={profile?.avatar_color} 
              className="w-12 h-12 text-lg shadow-sm" 
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground leading-tight">
                  {isGuest ? t('settings.register_button') : (profile?.full_name || t('settings.profileCard.namePlaceholder'))}
                </h1>
                {profile?.is_subscribed && !subscriptionCard && (
                  // Fallback simple badge if logic fails or expired but flag true
                  <div className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-yellow-200 flex items-center gap-1">
                    <Crown className="w-3 h-3 fill-current" /> Premium
                  </div>
                )}
              </div>
              {isGuest && <p className="text-xs text-primary font-medium">{t('settings.save_progress')}</p>}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={openGmailCompose} 
              className="rounded-full w-10 h-10 hover:bg-muted p-1.5"
            >
              <img src="/support-icon.png" alt="Soporte" className="w-full h-full object-contain dark:invert" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/configuration')} 
              className="rounded-full w-10 h-10 hover:bg-muted p-1.5"
            >
              <img src="/settings-icon.png" alt="Configuración" className="w-full h-full object-contain dark:invert" />
            </Button>
          </div>
        </div>

        {/* Dynamic Subscription Card */}
        {subscriptionCard}

        {/* Stats Card */}
        <Card className="bg-primary border-none shadow-md rounded-2xl text-primary-foreground overflow-hidden">
          <CardContent className="p-6 flex justify-between items-center text-center">
            <div className="flex flex-col gap-1 flex-1 border-r border-primary-foreground/20 last:border-0">
              <span className="text-2xl font-bold leading-none">
                <AnimatedNumber value={currentWeight} toFixed={1} />
                <span className="text-sm font-medium ml-0.5">{weightUnit}</span>
              </span>
              <span className="text-[10px] uppercase font-medium opacity-80">{t('settings.current_weight')}</span>
            </div>
            <div className="flex flex-col gap-1 flex-1 border-r border-primary-foreground/20 last:border-0">
              <span className="text-2xl font-bold leading-none">
                <AnimatedNumber value={goalWeight} toFixed={1} />
                <span className="text-sm font-medium ml-0.5">{weightUnit}</span>
              </span>
              <span className="text-[10px] uppercase font-medium opacity-80">{t('settings.goal_weight_short')}</span>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-2xl font-bold leading-none">
                <AnimatedNumber value={bmi} toFixed={1} />
              </span>
              <span className="text-[10px] uppercase font-medium opacity-80">{t('settings.current_bmi')}</span>
            </div>
          </CardContent>
        </Card>

        {/* Manage Intake Section */}
        <div>
          <h2 className="text-lg font-bold mb-4 px-1">{t('settings.manage_intake')}</h2>
          
          {/* Calories Card */}
          <Card className="border-none shadow-sm rounded-2xl mb-3">
            <CardContent className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-orange-500 text-lg">{t('nutritional_goals.calories')}</h3>
                <button 
                  onClick={() => navigate('/settings/nutritional-goals')}
                  className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('settings.edit')} <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground">
                    <AnimatedNumber value={goalCalories} /> <span className="text-sm font-medium">kcal</span>
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">{t('settings.daily_goal')}</p>
                </div>
                <div className="h-8 w-px bg-border mx-4" />
                <div className="space-y-1 text-right">
                  <p className="text-2xl font-bold text-foreground">
                    <AnimatedNumber value={goalCalories} /> <span className="text-sm font-medium">kcal</span>
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">{t('settings.caloric_budget')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Macros Card */}
          <Card className="border-none shadow-sm rounded-2xl">
            <CardContent className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-orange-500 text-lg">{t('settings.macros')}</h3>
                <button 
                  onClick={() => navigate('/settings/nutritional-goals')}
                  className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('settings.edit')} <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground">{carbPct}%</p>
                  <p className="text-xs text-muted-foreground font-medium">{t('settings.net_carbs')}</p>
                </div>
                <div className="space-y-1 relative">
                  <div className="absolute left-0 top-1 bottom-1 w-px bg-border" />
                  <p className="text-2xl font-bold text-foreground">{proteinPct}%</p>
                  <p className="text-xs text-muted-foreground font-medium">{t('settings.protein')}</p>
                  <div className="absolute right-0 top-1 bottom-1 w-px bg-border" />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground">{fatPct}%</p>
                  <p className="text-xs text-muted-foreground font-medium">{t('settings.fat')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default Settings;