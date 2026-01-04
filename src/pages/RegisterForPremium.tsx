import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const RegisterForPremium = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile, refetchProfile } = useAuth();

  const handleRegistrationSuccess = async (userId: string) => {
    toast.loading("Activando tu plan premium...", { id: "premium-activation" });

    try {
      // 1. Sync local profile data to Supabase
      if (profile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
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
            is_subscribed: true, // Activate subscription
          })
          .eq('id', userId);

        if (profileError) throw profileError;

        if (profile.weight) {
             await supabase.from('weight_history').insert({ user_id: userId, weight: profile.weight });
        }
      }

      await refetchProfile();
      toast.dismiss("premium-activation");
      toast.success("¡Cuenta creada y Premium activado!");
      navigate('/generating-plan');

    } catch (error: any) {
      console.error("Premium sync error:", error);
      toast.dismiss("premium-activation");
      toast.error("Error al activar premium. Contacta a soporte.");
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
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Guarda tu progreso</h1>
          <p className="text-muted-foreground mt-2">
            Para activar tu plan Premium, primero necesitamos crear tu cuenta segura.
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