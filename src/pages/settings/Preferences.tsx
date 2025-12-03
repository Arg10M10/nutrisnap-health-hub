import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
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
  const [badgeCelebrations, setBadgeCelebrations] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(false);

  const themeOptions = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Oscuro', icon: Moon },
    { value: 'system', label: 'Sistema', icon: Monitor },
  ];

  return (
    <PageLayout>
      <div className="space-y-8">
        <header className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">Preferencias</h1>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Tema de la Aplicación</CardTitle>
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
                        {/* Background Content (Image or Icon) */}
                        {option.value === 'light' ? (
                          <img src="/light-theme-preview.png" alt="Vista previa del tema claro" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <option.icon className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}

                        {/* Text Overlay */}
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
            <CardTitle>Notificaciones y Alertas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="badge-celebrations" className="font-semibold text-base">
                  Celebraciones de Insignias
                </Label>
                <p className="text-sm text-muted-foreground">
                  Muestra una animación al desbloquear una nueva insignia.
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
                  Recordatorios Diarios
                </Label>
                <p className="text-sm text-muted-foreground">
                  Recibe un recordatorio para registrar tus comidas.
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