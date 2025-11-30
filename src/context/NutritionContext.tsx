import { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import useLocalStorage from '@/hooks/useLocalStorage';
import { AnalysisResult } from '@/components/FoodAnalysisCard';

export interface RecentAnalysis extends AnalysisResult {
  id: string;
  imageUrl: string;
  timestamp: string;
  caloriesValue: number;
  proteinValue: number;
  carbsValue: number;
  fatsValue: number;
}

interface NutritionState {
  intake: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  recentAnalyses: RecentAnalysis[];
  addAnalysis: (result: AnalysisResult, imageUrl: string) => void;
}

const NutritionContext = createContext<NutritionState | undefined>(undefined);

// Helper to parse values like "10-15g" or "350 kcal" into a single number
const parseNutrientValue = (value: string): number => {
  if (!value) return 0;
  const numbers = value.match(/\d+/g)?.map(Number) || [];
  if (numbers.length === 0) return 0;
  if (numbers.length === 1) return numbers[0];
  // Return the average if it's a range
  return (numbers[0] + numbers[1]) / 2;
};

export const NutritionProvider = ({ children }: { children: ReactNode }) => {
  const [intake, setIntake] = useLocalStorage('nutrisnap-intake', {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });
  const [recentAnalyses, setRecentAnalyses] = useLocalStorage<RecentAnalysis[]>('nutrisnap-recent-analyses', []);

  const addAnalysis = (result: AnalysisResult, imageUrl: string) => {
    const caloriesValue = parseNutrientValue(result.calories);
    const proteinValue = parseNutrientValue(result.protein);
    const carbsValue = parseNutrientValue(result.carbs);
    const fatsValue = parseNutrientValue(result.fats);

    setIntake(prev => ({
      calories: prev.calories + caloriesValue,
      protein: prev.protein + proteinValue,
      carbs: prev.carbs + carbsValue,
      fats: prev.fats + fatsValue,
    }));

    const newAnalysis: RecentAnalysis = {
      ...result,
      id: new Date().toISOString(),
      imageUrl,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      caloriesValue,
      proteinValue,
      carbsValue,
      fatsValue,
    };

    setRecentAnalyses(prev => [newAnalysis, ...prev].slice(0, 10)); // Keep last 10
    toast.success(`${result.foodName} añadido a tu diario.`);
  };

  return (
    <NutritionContext.Provider value={{ intake, recentAnalyses, addAnalysis }}>
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