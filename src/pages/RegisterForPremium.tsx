import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Crown, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const RegisterForPremium = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { profile, refetchProfile } = useAuth();

  const isStandardRegistration = location.state?.isStandardRegistration === true;

  const handleRegistrationSuccess = async (userId: string) => {
    const loadingId = "registration-loading";
    toast.loading(isStandardRegistration ? "Creando tu cuenta..." : "Activando tu plan premium...", { id: loadingId });

    try {
      // 1. Sync local profile data to Supabase
      if (profile) {
        const updateData: any = {
            gender: profile.gender,
            age: profile.age,
            previous_apps_experience: profile.previous_apps_experience,
            units: profile.units,
            weight: profile.weight,
            starting_weight: profile.starting_weight,
            height: profile.height,
            motivation: profile.motivation,
            goal: profile.goal,
            goal_weight: profile.goal_weight,
            weekly_rate: profile.weekly_rate,
            onboarding_completed: true,
        };

        // Sólo activamos la suscripción si NO es un registro estándar (es decir, viene de la pantalla de pago)
        if (!isStandardRegistration) {
            updateData.is_subscribed = true;
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId);

        if (profileError) throw profileError;

        if (profile.weight) {
             await supabase.from('weight_history').insert({ user_id: userId, weight: profile.weight });
        }
      }

      // Forzamos la recarga del perfil con el ID específico del usuario recién creado
      await refetchProfile(userId);
      
      toast.dismiss(loadingId);
      
      if (isStandardRegistration) {
        toast.success("¡Cuenta creada con éxito! Tus datos han sido guardados.");
        navigate('/'); // Ir al home
      } else {
        toast.success("¡Cuenta creada y Premium activado!");
        navigate('/generating-plan'); // Flujo de onboarding
      }

    } catch (error: any) {
      console.error("Sync error:", error);
      toast.dismiss(loadingId);
      toast.error("Error al crear la cuenta. Por favor, contacta a soporte.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background p-4">
      <div className="mt-4 mb-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="pl-0 hover:bg-transparent">
          <ArrowLeft className="mr-2 h-5 w-5" /> {t('common.back')}
        </Button>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isStandardRegistration ? 'bg-primary/10' : 'bg-yellow-100'}`}>
            {isStandardRegistration ? (
                <UserPlus className="w-8 h-8 text-primary" />
            ) : (
                <Crown className="w-8 h-8 text-yellow-600" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-foreground">Guarda tu progreso</h1>
          <p className="text-muted-foreground mt-2 px-4">
            {isStandardRegistration 
                ? "Crea una cuenta gratuita para sincronizar tus datos y no perder tu avance." 
                : "Para activar tu plan Premium, primero necesitamos crear tu cuenta segura."}
          </p>
        </div>

        <Card className="border-none shadow-xl bg-card">
          <CardContent className="pt-6">
            <SignUpForm 
                onSwitchToSignIn={() => navigate('/login')} 
                onSuccess={handleRegistrationSuccess}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterForPremium;