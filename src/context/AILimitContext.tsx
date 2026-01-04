import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { startOfDay, subDays } from 'date-fns';
import AILimitDrawer from '@/components/AILimitDrawer';
import PremiumLockDrawer from '@/components/PremiumLockDrawer';

type AIFeature = 'food_scan' | 'exercise_ai' | 'diet_plan' | 'ai_suggestions' | 'manual_food_scan' | 'weight_log';
type TimeFrame = 'daily' | 'weekly';

interface AILimitContextType {
  checkLimit: (feature: AIFeature, limit: number, timeFrame?: TimeFrame) => Promise<boolean>;
  logUsage: (feature: AIFeature) => Promise<void>;
}

const AILimitContext = createContext<AILimitContextType | undefined>(undefined);

export const AILimitProvider = ({ children }: { children: ReactNode }) => {
  const { user, profile } = useAuth();
  const [isLimitOpen, setIsLimitOpen] = useState(false);
  const [isPremiumLockOpen, setIsPremiumLockOpen] = useState(false);
  const [drawerInfo, setDrawerInfo] = useState<{ limit: number, timeFrame: TimeFrame }>({ limit: 0, timeFrame: 'daily' });

  const checkLimit = useCallback(async (feature: AIFeature, limit: number, timeFrame: TimeFrame = 'daily'): Promise<boolean> => {
    // 1. Weight log is FREE for everyone (Guest & Registered)
    if (feature === 'weight_log') return true;

    // 2. BLOCK GUEST USERS IMMEDIATELY FOR AI FEATURES
    if (profile?.is_guest) {
      setIsPremiumLockOpen(true);
      return false;
    }

    if (!user) return false;

    // "manual_food_scan" uses AI, so it is now blocked for guests above, but check limit for subscribed
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
      // Trigger Limit UI
      setDrawerInfo({ limit, timeFrame });
      setIsLimitOpen(true);
      return false;
    }

    return true;
  }, [user, profile]);

  const logUsage = useCallback(async (feature: AIFeature) => {
    if (!user || profile?.is_guest) return;
    
    // Don't log manual food scans as usage since they are unlimited for PRO
    if (feature === 'manual_food_scan') return;
    
    // Don't log weight logs as usage
    if (feature === 'weight_log') return;

    const { error } = await supabase
      .from('ai_usage_logs')
      .insert({
        user_id: user.id,
        feature,
      });

    if (error) {
      console.error('Error logging usage:', error);
    }
  }, [user, profile]);

  return (
    <AILimitContext.Provider value={{ checkLimit, logUsage }}>
      {children}
      <AILimitDrawer 
        isOpen={isLimitOpen} 
        onClose={() => setIsLimitOpen(false)} 
        limit={drawerInfo.limit} 
        timeFrame={drawerInfo.timeFrame} 
      />
      <PremiumLockDrawer
        isOpen={isPremiumLockOpen}
        onClose={() => setIsPremiumLockOpen(false)}
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