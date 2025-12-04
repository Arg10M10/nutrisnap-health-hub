import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

const Preferences = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const [badgeCelebrations, setBadgeCelebrations] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(false);

  const themeOptions = [
    { value: 'light', label: t('preferences.theme_light'), icon: Sun, image: '/light-theme-preview.png' },
    { value: 'dark', label: t('preferences.theme_dark'), icon: Moon, image: '/dark-theme-preview.png' },
    { value: 'system', label: t('preferences.theme_system'), icon: Monitor, image: '/system-theme-preview.png' },
  ];

  return (
    <PageLayout>
      <div className="space-y-8">
        <header className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">{t('preferences.title')}</h1>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>{t('preferences.theme_title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {themeOptions.map((option) => (
                <Tooltip key={option.value}>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full h-32 p-0 relative overflow-hidden group',
                          theme === option.value && 'border-primary ring-2 ring-primary'
                        )}
                        onClick={() => setTheme(option.value)}
                      >
                        <img src={option.image} alt={`${option.label} theme preview`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        
                        <div className="absolute bottom-0 left-0 right-0 flex h-1/2 items-end justify-center p-2 bg-gradient-to-t from-black/70 to-transparent">
                          <div className="flex items-center gap-2 text-white">
                            <option.icon className="w-4 h-4" />
                            <span className="font-semibold text-sm">{option.label}</span>
                          </div>
                        </div>
                      </Button>
                    </div>
                  </TooltipTrigger>
                </Tooltip>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('preferences.notifications_title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="badge-celebrations" className="font-semibold text-base">
                  {t('preferences.badge_celebrations')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('preferences.badge_celebrations_desc')}
                </p>
              </div>
              <Switch
                id="badge-celebrations"
                checked={badgeCelebrations}
                onCheckedChange={setBadgeCelebrations}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="daily-reminders" className="font-semibold text-base">
                  {t('preferences.daily_reminders')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('preferences.daily_reminders_desc')}
                </p>
              </div>
              <Switch
                id="daily-reminders"
                checked={dailyReminders}
                onCheckedChange={setDailyReminders}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Preferences;