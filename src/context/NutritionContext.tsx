import { createContext, useContext, ReactNode, useMemo, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { AnalysisResult } from '@/components/FoodAnalysisCard';
import { format, isSameDay, subDays, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { MenuAnalysisData } from '@/components/MenuAnalysisDrawer';

export interface FoodEntry {
  id: string;
  created_at: string;
  food_name: string;
  image_url: string | null;
  calories: string | null;
  protein: string | null;
  carbs: string | null;
  fats: string | null;
  sugars: string | null;
  fiber: string | null;
  health_rating: 'Saludable' | 'Moderado' | 'Evitar';
  reason: string | null;
  calories_value: number | null;
  protein_value: number | null;
  carbs_value: number | null;
  fats_value: number | null;
  sugars_value: number | null;
  fiber_value: number | null;
  status: 'processing' | 'completed' | 'failed';
  analysis_data?: MenuAnalysisData | null;
}

export interface ExerciseEntry {
  id: string;
  created_at: string;
  exercise_type: string;
  intensity: string;
  duration_minutes: number;
  calories_burned: number;
  status: 'processing' | 'completed' | 'failed';
  description: string | null;
  reason: string | null;
}

export interface WaterEntry {
  id: string;
  created_at: string;
  glasses: number;
}

interface DailyIntake {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  sugars: number;
  fiber: number;
}

interface DailyData {
  intake: DailyIntake;
  analyses: (FoodEntry | ExerciseEntry)[];
  healthScore: number;
  waterIntake: number;
}

export interface UnlockedBadgeInfo {
  name: string;
  description: string;
  image: string;
}

interface NutritionState {
  addAnalysis: (result: AnalysisResult, imageUrl?: string) => void;
  deleteEntry: (id: string, type: 'food' | 'exercise') => void;
  getDataForDate: (date: Date) => DailyData;
  addWaterGlass: (date: Date, amount?: number) => void;
  removeWaterGlass: (date: Date) => void;
  isWaterUpdating: boolean;
  streak: number;
  waterStreak: number; 
  streakDays: string[];
  isLoading: boolean;
  unlockedBadge: UnlockedBadgeInfo | null;
  closeBadgeModal: () => void;
  triggerBadgeUnlock: (badgeInfo: UnlockedBadgeInfo) => void;
  unlockedBadgeIds: string[];
}

const NutritionContext = createContext<NutritionState | undefined>(undefined);

const parseNutrientValue = (value: string | null): number => {
  if (!value) return 0;
  const numbers = value.match(/\d+/g)?.map(Number) || [];
  if (numbers.length === 0) return 0;
  if (numbers.length === 1) return numbers[0];
  return (numbers[0] + numbers[1]) / 2;
};

// Algoritmo de Puntuación Mejorado
const healthRatingToScore = (rating: string | null): number => {
  if (!rating) return 50; // Neutro si no hay datos
  
  const r = rating.toLowerCase();
  
  if (r.includes('health') || r.includes('saludable')) return 100;
  if (r.includes('moderate') || r.includes('moderado')) return 65;
  if (r.includes('avoid') || r.includes('evitar') || r.includes('limit')) return 30;
  
  return 50; 
};

export const NutritionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<UnlockedBadgeInfo | null>(null);
  const { t } = useTranslation();

  const { data: foodEntries = [], isLoading: isFoodLoading } = useQuery<FoodEntry[]>({
    queryKey: ['food_entries', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('food_entries').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!user,
    refetchInterval: (query) => {
      const data = query.state.data as FoodEntry[] | undefined;
      if (data?.some(entry => entry.status === 'processing')) {
        return 2000;
      }
      return false;
    }
  });

  const { data: exerciseEntries = [], isLoading: isExerciseLoading } = useQuery<ExerciseEntry[]>({
    queryKey: ['exercise_entries', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('exercise_entries').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!user,
    refetchInterval: (query) => {
      const data = query.state.data as ExerciseEntry[] | undefined;
      if (data?.some(entry => entry.status === 'processing')) {
        return 2000;
      }
      return false;
    }
  });

  const { data: waterEntries = [], isLoading: isWaterLoading } = useQuery<WaterEntry[]>({
    queryKey: ['water_entries', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('water_entries').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: unlockedBadgeIds = [], isLoading: isBadgesLoading } = useQuery<string[]>({
    queryKey: ['user_badges', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('user_badges').select('badge_id').eq('user_id', user.id);
      if (error) throw error;
      return data.map(b => b.badge_id);
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) return;

    const foodChannel = supabase
      .channel('food_entries_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'food_entries', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.new.status === 'completed' || payload.new.status === 'failed') {
            queryClient.invalidateQueries({ queryKey: ['food_entries', user.id] });
          }
        }
      )
      .subscribe();
      
    const exerciseChannel = supabase
      .channel('exercise_entries_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'exercise_entries', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.new.status === 'completed' || payload.new.status === 'failed') {
            queryClient.invalidateQueries({ queryKey: ['exercise_entries', user.id] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(foodChannel);
      supabase.removeChannel(exerciseChannel);
    };
  }, [user, queryClient]);

  const addEntryMutation = useMutation({
    mutationFn: async (newEntry: Omit<FoodEntry, 'id' | 'created_at' | 'user_id'>) => {
      if (!user) throw new Error('User not found');
      const { error } = await supabase.from('food_entries').insert({ ...newEntry, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['food_entries', user?.id] }); },
    onError: (error) => {
        console.error('Error adding entry:', error);
        toast.error('No se pudo guardar el análisis.', { description: t('common.error_friendly') }); 
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string, type: 'food' | 'exercise' }) => {
      if (!user) throw new Error('User not found');
      const table = type === 'food' ? 'food_entries' : 'exercise_entries';
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { 
        queryClient.invalidateQueries({ queryKey: ['food_entries', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['exercise_entries', user?.id] });
        toast.success(t('common.deleted_success', 'Eliminado correctamente'));
    },
    onError: (error) => {
        console.error('Error deleting entry:', error);
        toast.error(t('common.error_friendly')); 
    },
  });

  const waterMutation = useMutation({
    mutationFn: async ({ action, date, amount = 1 }: { action: 'add' | 'remove', date: Date, amount?: number }) => {
      if (!user) throw new Error('User not found');
      if (action === 'add') {
        const { error } = await supabase.from('water_entries').insert({ user_id: user.id, glasses: amount, created_at: date.toISOString() });
        if (error) throw error;
      } else {
        const entriesForDay = waterEntries.filter(e => isSameDay(parseISO(e.created_at), date));
        if (entriesForDay.length > 0) {
          const lastEntry = entriesForDay.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
          const { error } = await supabase.from('water_entries').delete().eq('id', lastEntry.id);
          if (error) throw error;
        }
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['water_entries', user?.id] }); },
    onError: (error) => {
        console.error('Error updating water:', error);
        toast.error('No se pudo actualizar el agua.', { description: t('common.error_friendly') }); 
    },
  });

  const addAnalysis = (result: AnalysisResult, imageUrl = '/placeholder.svg') => {
    const newEntry = {
      food_name: result.foodName,
      image_url: imageUrl,
      calories: result.calories || '0 kcal',
      protein: result.protein || '0g',
      carbs: result.carbs || '0g',
      fats: result.fats || '0g',
      sugars: result.sugars || '0g',
      fiber: result.fiber || '0g',
      health_rating: result.healthRating,
      reason: result.reason,
      calories_value: parseNutrientValue(result.calories),
      protein_value: parseNutrientValue(result.protein),
      carbs_value: parseNutrientValue(result.carbs),
      fats_value: parseNutrientValue(result.fats),
      sugars_value: parseNutrientValue(result.sugars),
      fiber_value: parseNutrientValue(result.fiber),
      status: 'completed' as const,
    };
    addEntryMutation.mutate(newEntry);
  };

  const deleteEntry = (id: string, type: 'food' | 'exercise') => {
    deleteEntryMutation.mutate({ id, type });
  };

  const addWaterGlass = (date: Date, amount = 1) => waterMutation.mutate({ action: 'add', date, amount });
  const removeWaterGlass = (date: Date) => waterMutation.mutate({ action: 'remove', date });

  const getDataForDate = (date: Date): DailyData => {
    const dailyFood = foodEntries.filter(entry => isSameDay(parseISO(entry.created_at), date));
    const dailyExercise = exerciseEntries.filter(entry => isSameDay(parseISO(entry.created_at), date));
    const dailyWater = waterEntries.filter(entry => isSameDay(parseISO(entry.created_at), date));

    const foodIntake = dailyFood.reduce(
      (acc, entry) => ({
        calories: acc.calories + (entry.calories_value || 0),
        protein: acc.protein + (entry.protein_value || 0),
        carbs: acc.carbs + (entry.carbs_value || 0),
        fats: acc.fats + (entry.fats_value || 0),
        sugars: acc.sugars + (entry.sugars_value || 0),
        fiber: acc.fiber + (entry.fiber_value || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0, sugars: 0, fiber: 0 }
    );

    const caloriesBurned = dailyExercise.reduce((acc, entry) => acc + (entry.calories_burned || 0), 0);

    const intake = {
      ...foodIntake,
      calories: foodIntake.calories + caloriesBurned,
    };

    let healthScore = 100; 
    if (dailyFood.length > 0) {
      const totalScore = dailyFood.reduce((acc, entry) => acc + healthRatingToScore(entry.health_rating), 0);
      healthScore = Math.round(totalScore / dailyFood.length);
    } else {
      healthScore = 100;
      if (dailyFood.length === 0 && dailyExercise.length === 0 && dailyWater.length === 0) {
         healthScore = 0; 
      } else if (dailyFood.length === 0) {
         healthScore = 100;
      }
    }

    const waterIntake = dailyWater.reduce((acc, entry) => acc + entry.glasses, 0);

    const combinedAnalyses = [...dailyFood, ...dailyExercise].sort(
      (a, b) => parseISO(b.created_at).getTime() - parseISO(a.created_at).getTime()
    );

    return { intake, analyses: combinedAnalyses, healthScore, waterIntake };
  };

  const streakData = useMemo(() => {
    const entryDays = new Set(foodEntries.map(entry => format(parseISO(entry.created_at), 'yyyy-MM-dd')));
    if (entryDays.size === 0) return { streak: 0, streakDays: [] };

    const today = new Date();
    const todayKey = format(today, 'yyyy-MM-dd');
    const yesterday = subDays(today, 1);
    const yesterdayKey = format(yesterday, 'yyyy-MM-dd');

    let currentStreak = 0;
    const daysInStreak: string[] = [];
    
    let startDateForCount: Date;
    if (entryDays.has(todayKey)) {
        startDateForCount = today;
    } else if (entryDays.has(yesterdayKey)) {
        startDateForCount = yesterday;
    } else {
        return { streak: 0, streakDays: [] };
    }

    for (let i = 0; i < 365; i++) {
        const dateToCheck = subDays(startDateForCount, i);
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

  const waterData = useMemo(() => {
    const entryDays = new Set(waterEntries.map(entry => format(parseISO(entry.created_at), 'yyyy-MM-dd')));
    return { waterTotalDays: entryDays.size };
  }, [waterEntries]);

  const triggerBadgeUnlock = (badgeInfo: UnlockedBadgeInfo) => {
    // Badges disabled
  };

  const isLoading = isFoodLoading || isWaterLoading || isExerciseLoading || isBadgesLoading;

  const streak = streakData.streak;
  const totalWaterDays = waterData.waterTotalDays; 

  const closeBadgeModal = () => setNewlyUnlockedBadge(null);

  return (
    <NutritionContext.Provider value={{
      addAnalysis,
      deleteEntry,
      getDataForDate,
      addWaterGlass,
      removeWaterGlass,
      isWaterUpdating: waterMutation.isPending,
      streak: streak,
      waterStreak: totalWaterDays, 
      streakDays: streakData.streakDays,
      isLoading,
      unlockedBadge: newlyUnlockedBadge,
      closeBadgeModal,
      triggerBadgeUnlock,
      unlockedBadgeIds
    }}>
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