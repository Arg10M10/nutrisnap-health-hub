export interface UserStats {
  weight: number; // kg
  height: number; // cm
  age: number;
  gender: string;
  activityLevel: number; // estimated workouts per week
  goal: 'lose_weight' | 'maintain_weight' | 'gain_weight';
  weeklyRate: number; // kg per week
}

export const calculateNutritionPlan = (stats: UserStats) => {
  // 1. Calcular Tasa Metabólica Basal (BMR) - Fórmula Mifflin-St Jeor
  let bmr = (10 * stats.weight) + (6.25 * stats.height) - (5 * stats.age);
  
  // Ajuste por género
  if (stats.gender && stats.gender.toLowerCase() === 'female') {
    bmr -= 161;
  } else {
    bmr += 5; // Default to male calculation if unknown, or explicitly male
  }

  // 2. Multiplicador de Actividad (TDEE)
  // Basado en entrenamientos por semana estimados
  let activityMultiplier = 1.2; // Sedentario por defecto
  
  if (stats.activityLevel >= 6) activityMultiplier = 1.725; // Muy activo
  else if (stats.activityLevel >= 4) activityMultiplier = 1.55; // Moderadamente activo
  else if (stats.activityLevel >= 2) activityMultiplier = 1.375; // Ligeramente activo
  else activityMultiplier = 1.2; // Sedentario

  const tdee = Math.round(bmr * activityMultiplier);

  // 3. Ajuste por Objetivo
  // 1 kg de grasa corporal ≈ 7700 kcal
  // Déficit/Superávit diario = (Tasa Semanal * 7700) / 7
  const dailyCalorieDiff = Math.round((stats.weeklyRate * 7700) / 7);
  
  let targetCalories = tdee;
  
  if (stats.goal === 'lose_weight') {
    targetCalories = tdee - dailyCalorieDiff;
    
    // Límites de seguridad: No bajar de 1200 (mujeres) o 1500 (hombres) aprox.
    // Usamos 1200 como red de seguridad general para no ser demasiado restrictivos ciegamente.
    const minSafeCalories = 1200; 
    if (targetCalories < minSafeCalories) targetCalories = minSafeCalories;
    
  } else if (stats.goal === 'gain_weight') {
    targetCalories = tdee + dailyCalorieDiff;
  }

  // 4. Distribución de Macros
  // Estrategia equilibrada: 30% Proteína, 35% Carbohidratos, 35% Grasas
  // Proteína (4 kcal/g), Carbos (4 kcal/g), Grasas (9 kcal/g)
  
  const proteinRatio = 0.30;
  const fatRatio = 0.35;
  const carbRatio = 0.35;

  const protein = Math.round((targetCalories * proteinRatio) / 4);
  const fats = Math.round((targetCalories * fatRatio) / 9);
  const carbs = Math.round((targetCalories * carbRatio) / 4);

  // 5. Otros Nutrientes
  // Azúcares: Recomendación OMS < 10% de calorías totales (y idealmente < 5%)
  const sugars = Math.round((targetCalories * 0.10) / 4);
  
  // Fibra: Recomendación general ~14g por cada 1000 kcal
  const fiber = Math.round((targetCalories / 1000) * 14);

  return {
    calories: Math.round(targetCalories),
    protein,
    carbs,
    fats,
    sugars,
    fiber
  };
};