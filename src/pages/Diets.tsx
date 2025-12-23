import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import PageLayout from "@/components/PageLayout";
import { Loader2 } from "lucide-react";
import { DietsOnboarding } from "@/components/diets/DietsOnboarding";
import { WeeklyPlanDisplay } from "@/components/diets/WeeklyPlanDisplay";
import { useAILimit } from "@/hooks/useAILimit";

const Diets = () => {
  const { user, profile, refetchProfile } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { logUsage } = useAILimit();

  const { data: weeklyPlan, isLoading: isLoadingPlan } = useQuery({
    queryKey: ['weekly_diet_plan', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('weekly_diet_plans')
        .select('plan_data')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user && !!profile?.diet_onboarding_completed,
  });

  const regenerateMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not found");
      const { error } = await supabase
        .from('profiles')
        .update({ diet_onboarding_completed: false })
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      // Nota: La verificación del límite se hace en WeeklyPlanDisplay antes de llamar a esta mutación.
      await refetchProfile();
      queryClient.invalidateQueries({ queryKey: ['weekly_diet_plan', user?.id] });
    },
  });

  if (isLoadingPlan || !profile) {
    return <PageLayout><div className="flex justify-center mt-10"><Loader2 className="w-8 h-8 animate-spin" /></div></PageLayout>;
  }

  if (!profile.diet_onboarding_completed) {
    return <PageLayout><DietsOnboarding /></PageLayout>;
  }

  if (weeklyPlan) {
    return (
      <PageLayout>
        <WeeklyPlanDisplay 
          plan={weeklyPlan.plan_data} 
          onRegenerate={() => regenerateMutation.mutate()}
          isRegenerating={regenerateMutation.isPending}
        />
      </PageLayout>
    );
  }

  return <PageLayout><DietsOnboarding /></PageLayout>;
};

export default Diets;