import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  HealthConnect, 
  PermissionName, 
} from '@capacitor-community/health-connect';
import { Capacitor } from '@capacitor/core';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Activity, Smartphone, Footprints, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const ConnectApps = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isHealthConnectLinked, setIsHealthConnectLinked] = useState(false);
  const [isNative, setIsNative] = useState(false);
  const [stepCount, setStepCount] = useState(0);

  useEffect(() => {
    const checkPlatform = () => {
      const native = Capacitor.isNativePlatform();
      setIsNative(native);
      if (native) {
        checkPermissions();
      }
    };
    checkPlatform();
  }, []);

  // Verificar si ya tenemos permisos
  const checkPermissions = async () => {
    try {
      const isAvailable = await HealthConnect.isAvailable();
      if (!isAvailable) {
        console.log("Health Connect not available on this device.");
        return;
      }

      // Comprobar si tenemos permisos de lectura
      const result = await HealthConnect.checkPermissions({
        read: ['Steps']
      });

      if (result.granted.includes('Steps')) {
        setIsHealthConnectLinked(true);
        fetchSteps();
      }
    } catch (error) {
      console.error("Error checking permissions:", error);
    }
  };

  const handleToggle = async (checked: boolean) => {
    if (!isNative) {
      toast.info("Health Connect solo está disponible en dispositivos Android.");
      return;
    }

    if (checked) {
      // Solicitar permisos
      try {
        const isAvailable = await HealthConnect.isAvailable();
        
        if (!isAvailable) {
          // Intentar abrir la tienda para instalarlo si no está
          try {
             await HealthConnect.openHealthConnectSetting();
          } catch (e) {
             toast.error("Google Health Connect no está instalado.");
          }
          return;
        }

        const permissionResult = await HealthConnect.requestPermissions({
          read: ['Steps']
        });

        if (permissionResult.granted.includes('Steps')) {
          setIsHealthConnectLinked(true);
          toast.success("Health Connect conectado exitosamente.");
          fetchSteps();
        } else {
          setIsHealthConnectLinked(false);
          toast.error("Permisos denegados.");
        }
      } catch (error) {
        console.error("Error requesting permissions:", error);
        toast.error("Error al conectar con Health Connect.");
      }
    } else {
      // Desconectar (simbólico, ya que los permisos persisten en el sistema)
      setIsHealthConnectLinked(false);
      setStepCount(0);
      toast.info("Desconectado de Health Connect.");
    }
  };

  const fetchSteps = async () => {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const endOfDay = new Date();

      const result = await HealthConnect.getSteps({
        startTime: startOfDay.toISOString(),
        endTime: endOfDay.toISOString(),
      });

      // El resultado puede venir como un total directo o un array de registros dependiendo de la versión
      // La librería suele devolver: { count: number }
      
      const totalSteps = result.count || 0;
      setStepCount(totalSteps);

    } catch (error) {
      console.error("Error fetching steps:", error);
    }
  };

  return (
    <PageLayout>
      <div className="space-y-8">
        <header className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">{t('connect_apps.title')}</h1>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>{t('connect_apps.subtitle')}</CardTitle>
            <CardDescription>{t('connect_apps.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Google Health Connect Item */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50">
              <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded-full shadow-sm">
                  {/* Icono genérico o logo de Health Connect si tuviéramos */}
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{t('connect_apps.google_health_connect')}</p>
                  <p className="text-xs text-muted-foreground">
                    {isHealthConnectLinked ? t('connect_apps.status_connected') : t('connect_apps.status_connect')}
                  </p>
                </div>
              </div>
              <Switch 
                checked={isHealthConnectLinked}
                onCheckedChange={handleToggle}
                disabled={!isNative}
              />
            </div>

            {/* Aviso si no es nativo */}
            {!isNative && (
              <div className="flex gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-lg text-yellow-800 dark:text-yellow-500">
                <Smartphone className="w-5 h-5 flex-shrink-0" />
                <p className="text-xs">
                  Esta función requiere la aplicación móvil en un dispositivo Android real.
                </p>
              </div>
            )}

            {/* Vista Previa de Datos (Solo si conectado) */}
            {isHealthConnectLinked && (
              <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
                  {t('connect_apps.data_preview')}
                </h3>
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full text-primary">
                    <Footprints className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stepCount}</p>
                    <p className="text-xs text-muted-foreground font-medium">{t('connect_apps.total_steps')}</p>
                  </div>
                </div>
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default ConnectApps;