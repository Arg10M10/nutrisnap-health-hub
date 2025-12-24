import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Bell, Utensils, Droplets, Weight } from 'lucide-react';
import { NotificationManager } from '@/lib/notifications';
import useLocalStorage from '@/hooks/useLocalStorage';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';

const Reminders = () => {
  const navigate = useNavigate();
  const [mealReminders, setMealReminders] = useLocalStorage('settings_reminders_meals', false);
  const [waterReminders, setWaterReminders] = useLocalStorage('settings_reminders_water', false);
  const [weightReminders, setWeightReminders] = useLocalStorage('settings_reminders_weight', false);
  const [isNative, setIsNative] = useState(true);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
  }, []);

  const handleToggle = async (
    key: string, 
    value: boolean, 
    scheduler: () => Promise<void>, 
    canceller: () => Promise<void>
  ) => {
    if (!isNative) {
        toast.info("Las notificaciones funcionan mejor en la app móvil instalada.");
    }

    if (value) {
      const granted = await NotificationManager.requestPermissions();
      if (granted) {
        await scheduler();
        toast.success("Recordatorios activados");
      } else {
        toast.error("Permisos de notificación denegados");
        return; // No actualizar estado si no hay permisos
      }
    } else {
      await canceller();
      toast.info("Recordatorios desactivados");
    }

    // Actualizar estado local
    if (key === 'meals') setMealReminders(value);
    if (key === 'water') setWaterReminders(value);
    if (key === 'weight') setWeightReminders(value);
  };

  return (
    <PageLayout>
      <div className="space-y-8">
        <header className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">Recordatorios</h1>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" /> Configurar Alertas
            </CardTitle>
            <CardDescription>
              Recibe notificaciones locales para mantener tus hábitos. Máximo 4 al día.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Comidas</p>
                  <p className="text-sm text-muted-foreground">Desayuno, Almuerzo y Cena</p>
                </div>
              </div>
              <Switch 
                checked={mealReminders} 
                onCheckedChange={(v) => handleToggle('meals', v, () => NotificationManager.scheduleMealReminders(), () => NotificationManager.cancelMealReminders())} 
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Hidratación</p>
                  <p className="text-sm text-muted-foreground">Aviso suave por la tarde</p>
                </div>
              </div>
              <Switch 
                checked={waterReminders} 
                onCheckedChange={(v) => handleToggle('water', v, () => NotificationManager.scheduleWaterReminders(), () => NotificationManager.cancelWaterReminders())} 
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                  <Weight className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Peso y Progreso</p>
                  <p className="text-sm text-muted-foreground">Lunes y Jueves (9am)</p>
                </div>
              </div>
              <Switch 
                checked={weightReminders} 
                onCheckedChange={(v) => handleToggle('weight', v, () => NotificationManager.scheduleWeightReminder(), () => NotificationManager.cancelWeightReminders())} 
              />
            </div>

          </CardContent>
        </Card>

        {!isNative && (
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                <p className="text-xs text-yellow-800 text-center">
                    Nota: Los recordatorios funcionan mejor cuando la aplicación está instalada en un dispositivo móvil (Android/iOS). En web pueden no aparecer si el navegador está cerrado.
                </p>
            </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Reminders;