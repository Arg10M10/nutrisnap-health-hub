import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { AnalysisResult } from '@/components/FoodAnalysisCard';
import { format, isSameDay, subDays, parseISO } from 'date-fns';

// This is now the shape of our data from the Supabase table
export interface FoodEntry {
  id: string;
  created_at: string;
  food_name: string;
  image_url: string;
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
  sugars: string;
  health_rating: string;
  reason: string;
  calories_value: number;
  protein_value: number;
  carbs_value: number;
  fats_value: number;
}

interface DailyIntake {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface NutritionState {
  addAnalysis: (result: AnalysisResult, imageUrl?: string) => void;
  getDataForDate: (date: Date) => { intake: DailyIntake; analyses: FoodEntry[] };
  streak: number;
  streakDays: string[];
  isLoading: boolean;
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
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: foodEntries = [], isLoading } = useQuery<FoodEntry[]>({
    queryKey: ['food_entries', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('food_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!user,
  });

  const addEntryMutation = useMutation({
    mutationFn: async (newEntry: Omit<FoodEntry, 'id' | 'created_at' | 'user_id'>) => {
      if (!user) throw new Error('User not found');
      const { error } = await supabase.from('food_entries').insert({ ...newEntry, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food_entries', user?.id] });
    },
    onError: (error) => {
      toast.error('No se pudo guardar el análisis.', { description: error.message });
    },
  });

  const addAnalysis = (result: AnalysisResult, imageUrl = '/placeholder.svg') => {
    const newEntry = {
      food_name: result.foodName,
      image_url: imageUrl,
      calories: result.calories,
      protein: result.protein,
      carbs: result.carbs,
      fats: result.fats,
      sugars: result.sugars,
      health_rating: result.healthRating,
      reason: result.reason,
      calories_value: parseNutrientValue(result.calories),
      protein_value: parseNutrientValue(result.protein),
      carbs_value: parseNutrientValue(result.carbs),
      fats_value: parseNutrientValue(result.fats),
    };
    addEntryMutation.mutate(newEntry);
    toast.success(`${result.foodName} añadido a tu diario.`);
  };

  const getDataForDate = (date: Date) => {
    const analyses = foodEntries.filter(entry => isSameDay(parseISO(entry.created_at), date));
    const intake = analyses.reduce(
      (acc, entry) => ({
        calories: acc.calories + (entry.calories_value || 0),
        protein: acc.protein + (entry.protein_value || 0),
        carbs: acc.carbs + (entry.carbs_value || 0),
        fats: acc.fats + (entry.fats_value || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
    return { intake, analyses };
  };

  const streakData = useMemo(() => {
    if (!foodEntries.length) return { streak: 0, streakDays: [] };

    const entryDays = new Set(foodEntries.map(entry => format(parseISO(entry.created_at), 'yyyy-MM-dd')));
    
    let currentStreak = 0;
    const daysInStreak: string[] = [];
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const dateToCheck = subDays(today, i);
      const dateKey = format(dateToCheck, 'yyyy-MM-dd');
      if (entryDays.has(dateKey)) {
        currentStreak++;
        daysInStreak.push(dateKey);
      } else {
        break;
      }
    }
    return { streak: currentStreak, streakDays: daysInStreak };
  }, [foodEntries]);

  return (
    <NutritionContext.Provider value={{ addAnalysis, getDataForDate, ...streakData, isLoading }}>
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