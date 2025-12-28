import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { startOfDay, subDays } from 'date-fns';
import AILimitDrawer from '@/components/AILimitDrawer';

type AIFeature = 'food_scan' | 'exercise_ai' | 'diet_plan' | 'ai_suggestions' | 'manual_food_scan';
type TimeFrame = 'daily' | 'weekly';

interface AILimitContextType {
  checkLimit: (feature: AIFeature, limit: number, timeFrame?: TimeFrame) => Promise<boolean>;
  logUsage: (feature: AIFeature) => Promise<void>;
}

const AILimitContext = createContext<AILimitContextType | undefined>(undefined);

export const AILimitProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [drawerInfo, setDrawerInfo] = useState<{ limit: number, timeFrame: TimeFrame }>({ limit: 0, timeFrame: 'daily' });

  const checkLimit = useCallback(async (feature: AIFeature, limit: number, timeFrame: TimeFrame = 'daily'): Promise<boolean> => {
    if (!user) return false;

    // "manual_food_scan" is now unlimited, bypass check
    if (feature === 'manual_food_scan') return true;

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
      return false;
    }

    const currentCount = count || 0;
    
    if (currentCount >= limit) {
      // Trigger UI
      setDrawerInfo({ limit, timeFrame });
      setIsOpen(true);
      return false;
    }

    return true;
  }, [user]);

  const logUsage = useCallback(async (feature: AIFeature) => {
    if (!user) return;
    
    // Don't log manual food scans as usage since they are unlimited
    if (feature === 'manual_food_scan') return;

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

  return (
    <AILimitContext.Provider value={{ checkLimit, logUsage }}>
      {children}
      <AILimitDrawer 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        limit={drawerInfo.limit} 
        timeFrame={drawerInfo.timeFrame} 
      />
    </AILimitContext.Provider>
  );
};

export const useAILimit = () => {
  const context = useContext(AILimitContext);
  if (context === undefined) {
    throw new Error('useAILimit must be used within an AILimitProvider');
  }
  return context;
};