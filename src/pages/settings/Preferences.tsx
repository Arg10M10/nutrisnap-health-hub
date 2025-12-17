import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, Sun, Moon, Monitor, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const Preferences = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const { profile, user, refetchProfile } = useAuth();

  const mutation = useMutation({
    mutationFn: async (timeFormat: '12h' | '24h') => {
      if (!user) throw new Error('User not found');
      const { error } = await supabase
        .from('profiles')
        .update({ time_format: timeFormat })
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await refetchProfile();
      toast.success(t('preferences.toast_success'));
    },
    onError: (error: Error) => {
      toast.error(t('preferences.toast_error'), { description: error.message });
    },
  });

  const handleTimeFormatChange = (value: '12h' | '24h') => {
    if (value) {
      mutation.mutate(value);
    }
  };

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
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {t('preferences.time_format_title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ToggleGroup
              type="single"
              value={profile?.time_format || '12h'}
              onValueChange={handleTimeFormatChange}
              className="grid grid-cols-2 gap-2"
              disabled={mutation.isPending}
            >
              <ToggleGroupItem value="12h" className="h-12 text-base">{t('preferences.time_format_12h')}</ToggleGroupItem>
              <ToggleGroupItem value="24h" className="h-12 text-base">{t('preferences.time_format_24h')}</ToggleGroupItem>
            </ToggleGroup>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Preferences;