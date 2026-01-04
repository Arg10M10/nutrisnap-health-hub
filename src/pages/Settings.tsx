import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon, ChevronRight, Crown, Clock, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import PageLayout from "@/components/PageLayout";
import UserAvatar from "@/components/UserAvatar";
import { Card, CardContent } from "@/components/ui/card";
import AnimatedNumber from "@/components/AnimatedNumber";
import { differenceInDays, differenceInHours, addDays, parseISO, format } from "date-fns";
import { es } from "date-fns/locale";
import GuestBanner from "@/components/GuestBanner";

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

  // Estilo unificado verde lima
  const cardBaseStyle = "bg-primary rounded-2xl p-5 text-primary-foreground shadow-md flex items-center justify-between border border-primary/20 relative overflow-hidden group";

  // 1. Verificar Prueba Gratuita
  if (profile?.is_subscribed && profile.trial_start_date) {
    const startDate = parseISO(profile.trial_start_date);
    const endDate = addDays(startDate, 3);
    const hoursLeft = differenceInHours(endDate, now);

    if (hoursLeft > 0) {
      const daysLeft = Math.ceil(hoursLeft / 24);
      const remainingText = daysLeft === 1 ? `${hoursLeft}h restantes` : `${daysLeft} días restantes`;
      
      subscriptionCard = (
        <div className={cardBaseStyle}>
          {/* Decoración sutil */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/20 transition-colors pointer-events-none"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="bg-white/20 p-3 rounded-full border border-white/20 shadow-inner">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-lg text-white tracking-wide">Prueba Premium</p>
              <p className="text-sm text-white/90 font-medium">{remainingText}</p>
            </div>
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
    
    const icon = isAnnual ? <Crown className="w-6 h-6 text-white drop-shadow-sm" /> : <CalendarDays className="w-6 h-6 text-white drop-shadow-sm" />;
    
    if (daysLeft >= 0) {
      subscriptionCard = (
        <div className={cardBaseStyle}>
          {/* Decoración sutil */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:bg-white/20 transition-all"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm border border-white/20 shadow-inner">
              {icon}
            </div>
            <div>
              <p className="font-bold text-lg text-white drop-shadow-sm leading-tight">{planName}</p>
              <p className="text-xs text-white/90 font-medium">
                Renueva el {format(endDate, "d MMM yyyy", { locale: i18n.language === 'es' ? es : undefined })}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end relative z-10">
             <div className="text-3xl font-black leading-none drop-shadow-sm text-white">{daysLeft}</div>
             <div className="text-[10px] font-bold uppercase tracking-wider opacity-90 text-white">Días</div>
          </div>
        </div>
      );
    }
  }

  // Si no hay tarjeta de suscripción (porque no está suscrito o expiró), mostramos el GuestBanner
  if (!subscriptionCard) {
    subscriptionCard = <GuestBanner />;
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
                  // Fallback simple si expira o error, pero sigue marcado como suscrito
                  <div className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold border border-primary/20 flex items-center gap-1">
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

        {/* Dynamic Subscription Card or GuestBanner */}
        {subscriptionCard}

        {/* Stats Card */}
        <Card className="bg-card border-none shadow-md rounded-2xl overflow-hidden">
          <CardContent className="p-6 flex justify-between items-center text-center">
            <div className="flex flex-col gap-1 flex-1 border-r border-border last:border-0">
              <span className="text-2xl font-bold leading-none text-foreground">
                <AnimatedNumber value={currentWeight} toFixed={1} />
                <span className="text-sm font-medium ml-0.5 text-muted-foreground">{weightUnit}</span>
              </span>
              <span className="text-[10px] uppercase font-medium text-muted-foreground">{t('settings.current_weight')}</span>
            </div>
            <div className="flex flex-col gap-1 flex-1 border-r border-border last:border-0">
              <span className="text-2xl font-bold leading-none text-foreground">
                <AnimatedNumber value={goalWeight} toFixed={1} />
                <span className="text-sm font-medium ml-0.5 text-muted-foreground">{weightUnit}</span>
              </span>
              <span className="text-[10px] uppercase font-medium text-muted-foreground">{t('settings.goal_weight_short')}</span>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-2xl font-bold leading-none text-foreground">
                <AnimatedNumber value={bmi} toFixed={1} />
              </span>
              <span className="text-[10px] uppercase font-medium text-muted-foreground">{t('settings.current_bmi')}</span>
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