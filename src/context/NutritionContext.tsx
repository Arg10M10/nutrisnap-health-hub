import { createContext, useContext, ReactNode, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { AnalysisResult } from '@/components/FoodAnalysisCard';
import { format, isSameDay, subDays, parseISO } from 'date-fns';
import useLocalStorage from '@/hooks/useLocalStorage';
import { streakBadges, waterBadges } from '@/data/badges';
import BadgeNotification from '@/components/BadgeNotification';

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
  health_rating: 'Saludable' | 'Moderado' | 'Evitar';
  reason: string | null;
  calories_value: number | null;
  protein_value: number | null;
  carbs_value: number | null;
  fats_value: number | null;
  sugars_value: number | null;
  status: 'processing' | 'completed' | 'failed';
}

export interface ExerciseEntry {
  id: string;
  created_at: string;
  exercise_type: string;
  intensity: string;
  duration_minutes: number;
  calories_burned: number;
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
}

interface DailyData {
  intake: DailyIntake;
  analyses: (FoodEntry | ExerciseEntry)[];
  healthScore: number;
  waterIntake: number;
}

interface NutritionState {
  addAnalysis: (result: AnalysisResult, imageUrl?: string) => void;
  getDataForDate: (date: Date) => DailyData;
  addWaterGlass: (date: Date) => void;
  removeWaterGlass: (date: Date) => void;
  isWaterUpdating: boolean;
  streak: number;
  waterStreak: number;
  streakDays: string[];
  isLoading: boolean;
}

const NutritionContext = createContext<NutritionState | undefined>(undefined);

const parseNutrientValue = (value: string | null): number => {
  if (!value) return 0;
  const numbers = value.match(/\d+/g)?.map(Number) || [];
  if (numbers.length === 0) return 0;
  if (numbers.length === 1) return numbers[0];
  return (numbers[0] + numbers[1]) / 2;
};

const healthRatingToScore = (rating: FoodEntry['health_rating']): number => {
  switch (rating) {
    case 'Saludable': return 100;
    case 'Moderado': return 60;
    case 'Evitar': return 20;
    default: return 50;
  }
};

export const NutritionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [unlockedBadges, setUnlockedBadges] = useLocalStorage<string[]>('unlockedBadges', []);

  // Polling inteligente: Si hay algún item "processing", recarga cada 2 segundos.
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
      // Si hay entradas procesando, refrescar cada 2s
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

  // Mantener suscripción Realtime como respaldo inmediato
  useEffect(() => {
    if (!user) return;

    const channel = supabase
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const addEntryMutation = useMutation({
    mutationFn: async (newEntry: Omit<FoodEntry, 'id' | 'created_at' | 'user_id'>) => {
      if (!user) throw new Error('User not found');
      const { error } = await supabase.from('food_entries').insert({ ...newEntry, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['food_entries', user?.id] }); },
    onError: (error) => { toast.error('No se pudo guardar el análisis.', { description: error.message }); },
  });

  const waterMutation = useMutation({
    mutationFn: async ({ action, date }: { action: 'add' | 'remove', date: Date }) => {
      if (!user) throw new Error('User not found');
      if (action === 'add') {
        const { error } = await supabase.from('water_entries').insert({ user_id: user.id, glasses: 1, created_at: date.toISOString() });
        if (error) throw error;
      } else {
        const entriesForDay = waterEntries.filter(e => isSameDay(parseISO(e.created_at), date));
        if (entriesForDay.length > 0) {
          const lastEntry = entriesForDay[0];
          const { error } = await supabase.from('water_entries').delete().eq('id', lastEntry.id);
          if (error) throw error;
        }
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['water_entries', user?.id] }); },
    onError: (error) => { toast.error('No se pudo actualizar el agua.', { description: error.message }); },
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
      health_rating: result.healthRating,
      reason: result.reason,
      calories_value: parseNutrientValue(result.calories),
      protein_value: parseNutrientValue(result.protein),
      carbs_value: parseNutrientValue(result.carbs),
      fats_value: parseNutrientValue(result.fats),
      sugars_value: parseNutrientValue(result.sugars),
      status: 'completed' as const,
    };
    addEntryMutation.mutate(newEntry);
    toast.success(`${result.foodName} añadido a tu diario.`);
  };

  const addWaterGlass = (date: Date) => waterMutation.mutate({ action: 'add', date });
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
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0, sugars: 0 }
    );

    const caloriesBurned = dailyExercise.reduce((acc, entry) => acc + (entry.calories_burned || 0), 0);

    const intake = {
      ...foodIntake,
      calories: foodIntake.calories + caloriesBurned,
    };

    const healthScore = dailyFood.length > 0
      ? dailyFood.reduce((acc, entry) => acc + healthRatingToScore(entry.health_rating), 0) / dailyFood.length
      : 0;

    const waterIntake = dailyWater.reduce((acc, entry) => acc + entry.glasses, 0);

    const combinedAnalyses = [...dailyFood, ...dailyExercise].sort(
      (a, b) => parseISO(b.created_at).getTime() - parseISO(a.created_at).getTime()
    );

    return { intake, analyses: combinedAnalyses, healthScore, waterIntake };
  };

  const streakData = useMemo(() => {
    if (!foodEntries.length) return { streak: 0, streakDays: [] };

    const entryDays = new Set(foodEntries.map(entry => format(parseISO(entry.created_at), 'yyyy-MM-dd')));

    const sortedDates = Array.from(entryDays).sort();
    const lastDayKey = sortedDates[sortedDates.length - 1];
    const lastDayDate = parseISO(lastDayKey);

    let currentStreak = 0;
    const daysInStreak: string[] = [];

    for (let i = 0; i < 365; i++) {
      const dateToCheck = subDays(lastDayDate, i);
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

  const waterStreakData = useMemo(() => {
    if (!waterEntries.length) return { waterStreak: 0 };
    const entryDays = new Set(waterEntries.map(entry => format(parseISO(entry.created_at), 'yyyy-MM-dd')));
    let currentStreak = 0;

    const sortedDates = Array.from(entryDays).sort();
    const lastDayKey = sortedDates[sortedDates.length - 1];
    const lastDayDate = parseISO(lastDayKey);

    for (let i = 0; i < 365; i++) {
      const dateToCheck = subDays(lastDayDate, i);
      const dateKey = format(dateToCheck, 'yyyy-MM-dd');
      if (entryDays.has(dateKey)) {
        currentStreak++;
      } else {
        break;
      }
    }
    return { waterStreak: currentStreak };
  }, [waterEntries]);

  useEffect(() => {
    const { streak } = streakData;
    const { waterStreak } = waterStreakData;

    const checkAndNotify = (badges: any[], currentStreak: number, type: 'days') => {
      badges.forEach(badge => {
        if (currentStreak >= badge[type] && !unlockedBadges.includes(badge.name)) {
          toast.custom((t) => (
            <div className="bg-card border p-4 rounded-lg shadow-lg w-full max-w-md">
              <BadgeNotification {...badge} />
            </div>
          ), { duration: 5000 });
          setUnlockedBadges(prev => [...prev, badge.name]);
        }
      });
    };

    checkAndNotify(streakBadges, streak, 'days');
    checkAndNotify(waterBadges, waterStreak, 'days');
  }, [streakData, waterStreakData, unlockedBadges, setUnlockedBadges]);

  return (
    <NutritionContext.Provider value={{
      addAnalysis,
      getDataForDate,
      addWaterGlass,
      removeWaterGlass,
      isWaterUpdating: waterMutation.isPending,
      ...streakData,
      waterStreak: waterStreakData.waterStreak,
      isLoading: isFoodLoading || isWaterLoading || isExerciseLoading
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