import { createContext, useContext, ReactNode, useMemo } from 'react';
import { toast } from 'sonner';
import useLocalStorage from '@/hooks/useLocalStorage';
import { AnalysisResult } from '@/components/FoodAnalysisCard';
import { format, isSameDay, subDays } from 'date-fns';

export interface RecentAnalysis extends AnalysisResult {
  id: string;
  imageUrl: string;
  timestamp: string; // Now an ISO string
  caloriesValue: number;
  proteinValue: number;
  carbsValue: number;
  fatsValue: number;
}

interface DailyIntake {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

type IntakeHistory = Record<string, DailyIntake>; // Key is "yyyy-MM-dd"

interface NutritionState {
  addAnalysis: (result: AnalysisResult, imageUrl?: string) => void;
  getDataForDate: (date: Date) => { intake: DailyIntake; analyses: RecentAnalysis[] };
  streak: number;
  streakDays: string[];
}

const NutritionContext = createContext<NutritionState | undefined>(undefined);

const parseNutrientValue = (value: string): number => {
  if (!value) return 0;
  const numbers = value.match(/\d+/g)?.map(Number) || [];
  if (numbers.length === 0) return 0;
  if (numbers.length === 1) return numbers[0];
  return (numbers[0] + numbers[1]) / 2;
};

export const NutritionProvider = ({ children }: { children: ReactNode }) => {
  const [intakeHistory, setIntakeHistory] = useLocalStorage<IntakeHistory>('nutrisnap-intake-history', {});
  const [recentAnalyses, setRecentAnalyses] = useLocalStorage<RecentAnalysis[]>('nutrisnap-recent-analyses', []);

  const streakData = useMemo(() => {
    let currentStreak = 0;
    const daysInStreak: string[] = [];
    const today = new Date();

    for (let i = 0; i < 365; i++) { // Check up to a year back
      const dateToCheck = subDays(today, i);
      const dateKey = format(dateToCheck, 'yyyy-MM-dd');
      const intakeForDay = intakeHistory[dateKey];

      if (intakeForDay && intakeForDay.calories > 0) {
        currentStreak++;
        daysInStreak.push(dateKey);
      } else {
        break; // Streak is broken
      }
    }
    return { streak: currentStreak, streakDays: daysInStreak };
  }, [intakeHistory]);

  const addAnalysis = (result: AnalysisResult, imageUrl = '/placeholder.svg') => {
    const caloriesValue = parseNutrientValue(result.calories);
    const proteinValue = parseNutrientValue(result.protein);
    const carbsValue = parseNutrientValue(result.carbs);
    const fatsValue = parseNutrientValue(result.fats);

    const todayKey = format(new Date(), 'yyyy-MM-dd');

    setIntakeHistory(prev => {
      const todayIntake = prev[todayKey] || { calories: 0, protein: 0, carbs: 0, fats: 0 };
      return {
        ...prev,
        [todayKey]: {
          calories: todayIntake.calories + caloriesValue,
          protein: todayIntake.protein + proteinValue,
          carbs: todayIntake.carbs + carbsValue,
          fats: todayIntake.fats + fatsValue,
        }
      };
    });

    const newAnalysis: RecentAnalysis = {
      ...result,
      id: new Date().toISOString(),
      imageUrl,
      timestamp: new Date().toISOString(),
      caloriesValue,
      proteinValue,
      carbsValue,
      fatsValue,
    };

    setRecentAnalyses(prev => [newAnalysis, ...prev]);
    toast.success(`${result.foodName} añadido a tu diario.`);
  };

  const getDataForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const intake = intakeHistory[dateKey] || { calories: 0, protein: 0, carbs: 0, fats: 0 };
    const analyses = recentAnalyses.filter(analysis => isSameDay(new Date(analysis.timestamp), date));
    return { intake, analyses };
  };

  return (
    <NutritionContext.Provider value={{ addAnalysis, getDataForDate, ...streakData }}>
      {children}
    </NutritionContext.Provider>
  );
};

export const useNutrition = () => {
  const context = useContext(NutritionContext);
  if (context === undefined) {
    throw new Error('useNutrition must be used within a NutritionProvider');
  }
  return context;
};