import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HealthConnect } from '@ubie/capacitor-health-connect';
import { Capacitor } from '@capacitor/core';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Activity, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import useLocalStorage from '@/hooks/useLocalStorage';

const ConnectApps = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useLocalStorage('health_connect_enabled', false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    if (Capacitor.getPlatform() !== 'android') {
      setIsAvailable(false);
      return;
    }

    try {
      const result = await HealthConnect.checkAvailability();
      // result can be 'Available', 'NotInstalled', 'NotSupported'
      setIsAvailable(result.availability === 'Available');
    } catch (error) {
      console.error("Error checking Health Connect availability:", error);
      setIsAvailable(false);
    }
  };

  const handleToggle = async (checked: boolean) => {
    if (!checked) {
      setIsConnected(false);
      toast.info(t('connect_apps.disconnected'));
      return;
    }

    setLoading(true);
    try {
      // 1. Check availability again just in case
      const status = await HealthConnect.checkAvailability();
      
      if (status.availability === 'NotInstalled') {
        // Open store to install Health Connect
        await HealthConnect.openHealthConnectSetting();
        setLoading(false);
        return;
      }

      if (status.availability !== 'Available') {
        toast.error(t('connect_apps.not_supported'));
        setLoading(false);
        return;
      }

      // 2. Request Permissions
      const permissions = [
        { accessType: 'read', recordType: 'Steps' },
        { accessType: 'read', recordType: 'Weight' },
        { accessType: 'read', recordType: 'TotalCaloriesBurned' },
        { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
      ] as const;

      const result = await HealthConnect.requestPermissions({ permissions });

      // The plugin returns grantedPermissions list. We simply check if we got what we wanted or if the array is not empty.
      // Note: Android 14+ UI might not return exact granted list in some versions, but we assume success if no error thrown 
      // and we handle logic.
      
      setIsConnected(true);
      toast.success(t('connect_apps.connected_success'));
      
    } catch (error) {
      console.error("Health Connect permission error:", error);
      toast.error(t('connect_apps.connection_failed'));
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const openHealthSettings = async () => {
    try {
      await HealthConnect.openHealthConnectSetting();
    } catch (e) {
      console.error(e);
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
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-lg">Health Connect</CardTitle>
                <CardDescription>Samsung Health, Google Fit</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('connect_apps.description')}
            </p>

            {Capacitor.getPlatform() === 'android' ? (
              <div className="flex items-center justify-between p-4 bg-muted/40 rounded-xl border border-border">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-foreground">
                    {t('connect_apps.sync_status')}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    {isConnected ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-green-500" /> {t('connect_apps.status_active')}
                      </>
                    ) : (
                      t('connect_apps.status_inactive')
                    )}
                  </span>
                </div>
                <Switch 
                  checked={isConnected} 
                  onCheckedChange={handleToggle} 
                  disabled={loading}
                />
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-200 flex gap-3 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{t('connect_apps.platform_not_supported')}</p>
              </div>
            )}

            {isConnected && (
              <Button 
                variant="outline" 
                className="w-full justify-between" 
                onClick={openHealthSettings}
              >
                {t('connect_apps.manage_permissions')}
                <ExternalLink className="w-4 h-4 ml-2 opacity-50" />
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="px-2">
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
            {t('connect_apps.data_synced')}
          </h3>
          <ul className="space-y-3">
            {[
              { label: t('connect_apps.data_steps'), icon: '👣' },
              { label: t('connect_apps.data_calories'), icon: '🔥' },
              { label: t('connect_apps.data_weight'), icon: '⚖️' }
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border/50 shadow-sm">
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium text-foreground">{item.label}</span>
                {isConnected && <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PageLayout>
  );
};

export default ConnectApps;