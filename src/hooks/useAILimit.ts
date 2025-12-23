import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { startOfDay, subDays } from 'date-fns';

type AIFeature = 'food_scan' | 'exercise_ai' | 'diet_plan' | 'ai_suggestions' | 'manual_food_scan';
type TimeFrame = 'daily' | 'weekly';

export const useAILimit = () => {
  const { user } = useAuth();

  const checkLimit = useCallback(async (feature: AIFeature, limit: number, timeFrame: TimeFrame = 'daily'): Promise<{ canProceed: boolean, limit: number, timeFrame: TimeFrame }> => {
    if (!user) return { canProceed: false, limit, timeFrame };

    const now = new Date();
    let startDate = startOfDay(now);

    if (timeFrame === 'weekly') {
      startDate = subDays(now, 7);
    }

    const { count, error } = await supabase
      .from('ai_usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('feature', feature)
      .gte('created_at', startDate.toISOString());

    if (error) {
      console.error('Error checking limit:', error);
      return { canProceed: false, limit, timeFrame };
    }

    const currentCount = count || 0;
    
    if (currentCount >= limit) {
      return { canProceed: false, limit, timeFrame };
    }

    return { canProceed: true, limit, timeFrame };
  }, [user]);

  const logUsage = useCallback(async (feature: AIFeature) => {
    if (!user) return;

    const { error } = await supabase
      .from('ai_usage_logs')
      .insert({
        user_id: user.id,
        feature,
      });

    if (error) {
      console.error('Error logging usage:', error);
    }
  }, [user]);

  return { checkLimit, logUsage };
};