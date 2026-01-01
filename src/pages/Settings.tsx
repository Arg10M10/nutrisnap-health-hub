import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import PageLayout from "@/components/PageLayout";
import UserAvatar from "@/components/UserAvatar";
import { Card, CardContent } from "@/components/ui/card";
import AnimatedNumber from "@/components/AnimatedNumber";
import { SupportIcon } from "@/components/icons/SupportIcon";

const SUPPORT_EMAIL = "calorel.help@gmail.com";

const calculateBMI = (weight: number | null, height: number | null, units: string | null) => {
  if (!weight || !height || height === 0) return 0;
  
  let w = weight;
  let h = height;

  // Si es imperial, convertir a métrico para la fórmula estándar
  if (units === 'imperial') {
    w = weight * 0.453592; // lbs a kg
    h = height * 2.54;     // in a cm
  }

  // Fórmula: peso (kg) / [estatura (m)]^2
  const heightInMeters = h / 100;
  const bmi = w / (heightInMeters * heightInMeters);
  return parseFloat(bmi.toFixed(1));
};

const Settings = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isImperial = profile?.units === 'imperial';
  const weightUnit = isImperial ? 'lbs' : 'kg';
  
  const currentWeight = profile?.weight || 0;
  const goalWeight = profile?.goal_weight || 0;
  const bmi = calculateBMI(currentWeight, profile?.height || 0, profile?.units || 'metric');

  // Metas nutricionales
  const goalCalories = profile?.goal_calories || 2000;
  const goalProtein = profile?.goal_protein || 0;
  const goalCarbs = profile?.goal_carbs || 0;
  const goalFats = profile?.goal_fats || 0;

  // Convertir gramos a porcentaje aproximado (4 kcal/g prot/carb, 9 kcal/g fat)
  const totalCalFromMacros = (goalProtein * 4) + (goalCarbs * 4) + (goalFats * 9);
  const safeTotal = totalCalFromMacros > 0 ? totalCalFromMacros : 1; // Evitar división por cero

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
        // fallback
      }
    }

    setTimeout(() => {
      window.location.href = `mailto:${SUPPORT_EMAIL}`;
    }, 700);
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3" onClick={() => navigate('/settings/edit-profile')}>
            <UserAvatar 
              name={profile?.full_name} 
              color={profile?.avatar_color} 
              className="w-12 h-12 text-lg shadow-sm" 
            />
            <h1 className="text-xl font-bold text-foreground leading-tight">
              {profile?.full_name || t('settings.profileCard.namePlaceholder')}
            </h1>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={openGmailCompose} 
              className="rounded-full w-10 h-10 hover:bg-muted"
            >
              <SupportIcon className="w-6 h-6 text-foreground" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/configuration')} 
              className="rounded-full w-10 h-10 hover:bg-muted"
            >
              <SettingsIcon className="w-6 h-6 text-foreground" />
            </Button>
          </div>
        </div>

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
                <h3 className="font-bold text-orange-500 text-lg">Macros</h3>
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