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
import { calculateNutritionPlan } from '@/lib/nutritionCalculator';

const RegisterForPremium = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { refetchProfile } = useAuth();

  const isStandardRegistration = location.state?.isStandardRegistration === true;

  const handleRegistrationSuccess = async (userId: string) => {
    const loadingId = "registration-loading";
    toast.loading("Sincronizando tus datos...", { id: loadingId });

    try {
      // Intentamos recuperar los datos locales directamente del localStorage
      const localDataString = window.localStorage.getItem('calorel_local_profile');
      const localProfile = localDataString ? JSON.parse(localDataString) : null;

      if (localProfile) {
        // Verificar si los macros ya existen, si no, calcularlos aquí como respaldo
        let nutritionPlan = {
          calories: localProfile.goal_calories,
          protein: localProfile.goal_protein,
          carbs: localProfile.goal_carbs,
          fats: localProfile.goal_fats,
          sugars: localProfile.goal_sugars,
          fiber: localProfile.goal_fiber,
        };

        if (!nutritionPlan.calories) {
            // Si faltan, recálculo de emergencia
            const isImperial = localProfile.units === 'imperial';
            const weightInKg = isImperial ? localProfile.weight * 0.453592 : localProfile.weight;
            const heightInCm = isImperial ? localProfile.height * 2.54 : localProfile.height;
            const weeklyRateInKg = isImperial ? localProfile.weekly_rate * 0.453592 : localProfile.weekly_rate;

            nutritionPlan = calculateNutritionPlan({
                weight: weightInKg || 70,
                height: heightInCm || 170,
                age: localProfile.age || 30,
                gender: localProfile.gender || 'male',
                activityLevel: 3, // Default moderate if unknown
                goal: localProfile.goal || 'maintain_weight',
                weeklyRate: weeklyRateInKg || 0
            });
        }

        const updateData: any = {
            gender: localProfile.gender,
            age: localProfile.age,
            previous_apps_experience: localProfile.previous_apps_experience,
            units: localProfile.units,
            weight: localProfile.weight,
            starting_weight: localProfile.starting_weight,
            height: localProfile.height,
            motivation: localProfile.motivation,
            goal: localProfile.goal,
            goal_weight: localProfile.goal_weight,
            weekly_rate: localProfile.weekly_rate,
            onboarding_completed: true,
            // Incluir macros sincronizados
            goal_calories: nutritionPlan.calories,
            goal_protein: nutritionPlan.protein,
            goal_carbs: nutritionPlan.carbs,
            goal_fats: nutritionPlan.fats,
            goal_sugars: nutritionPlan.sugars,
            goal_fiber: nutritionPlan.fiber,
            
            is_subscribed: false 
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId);

        if (profileError) throw profileError;

        if (localProfile.weight) {
             await supabase.from('weight_history').insert({ user_id: userId, weight: localProfile.weight });
        }
      }

      // Forzamos la recarga del perfil
      await refetchProfile(userId);
      
      toast.dismiss(loadingId);
      
      if (isStandardRegistration) {
        toast.success("¡Cuenta creada con éxito!");
        navigate('/'); 
      } else {
        // FLUJO PREMIUM:
        toast.success("Cuenta creada. Ahora selecciona tu plan.");
        navigate('/subscribe', { replace: true }); 
      }

    } catch (error: any) {
      console.error("Sync error:", error);
      toast.dismiss(loadingId);
      toast.error("Error al sincronizar datos.", { description: error.message });
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
                : "Para activar tu plan Premium, primero necesitamos crear tu cuenta segura para guardar tus datos."}
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