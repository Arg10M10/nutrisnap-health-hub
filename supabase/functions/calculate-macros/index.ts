import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { gender, age, height, weight, workoutsPerWeek, goal, weeklyRate } = await req.json();

    // 1. Validación y Valores por Defecto Seguros
    const safeWeight = Number(weight) || 70;
    const safeHeight = Number(height) || 170;
    const safeAge = Number(age) || 30;
    const safeWorkouts = Number(workoutsPerWeek) || 3;
    const isMale = gender?.toLowerCase() === 'male';
    const targetWeeklyChange = Number(weeklyRate) || 0.5; // kg por semana

    // 2. Cálculo de BMR (Tasa Metabólica Basal) - Ecuación Mifflin-St Jeor (Estándar de Oro)
    // Hombres: (10 × peso en kg) + (6.25 × altura en cm) - (5 × edad en años) + 5
    // Mujeres: (10 × peso en kg) + (6.25 × altura en cm) - (5 × edad en años) - 161
    let bmr = (10 * safeWeight) + (6.25 * safeHeight) - (5 * safeAge);
    bmr += isMale ? 5 : -161;

    // 3. Multiplicador de Actividad (TDEE)
    // Asumimos un factor base y sumamos según entrenamientos para ser más precisos
    let activityMultiplier = 1.2; // Sedentario base
    if (safeWorkouts >= 1 && safeWorkouts <= 2) activityMultiplier = 1.375; // Ligero
    else if (safeWorkouts >= 3 && safeWorkouts <= 5) activityMultiplier = 1.55; // Moderado
    else if (safeWorkouts >= 6) activityMultiplier = 1.725; // Intenso

    const tdee = Math.round(bmr * activityMultiplier);

    // 4. Ajuste por Objetivo (Déficit/Superávit)
    // 1kg de grasa corporal ≈ 7700 kcal.
    // Déficit diario necesario = (kg_semana * 7700) / 7
    const dailyCalorieDelta = Math.round((targetWeeklyChange * 7700) / 7);
    
    let targetCalories = tdee;

    if (goal === 'lose_weight') {
      targetCalories = tdee - dailyCalorieDelta;
      // Límite de seguridad: nunca bajar de BMR sin supervisión médica, o mínimo 1200/1500
      const minSafeCalories = isMale ? 1500 : 1200;
      if (targetCalories < minSafeCalories) targetCalories = minSafeCalories;
    } else if (goal === 'gain_weight') {
      targetCalories = tdee + dailyCalorieDelta;
    }

    // 5. Distribución de Macros (Enfoque Equilibrado/Alto en Proteína)
    // Proteína: Esencial para mantener músculo en déficit. 
    // Objetivo: ~2g por kg de peso (o 30% de calorías si es obesidad)
    let proteinGrams = Math.round(safeWeight * 2); 
    const proteinCals = proteinGrams * 4;

    // Si la proteína excede el 40% de las calorías totales (raro, pero posible en dietas muy bajas), ajustamos
    if (proteinCals > (targetCalories * 0.4)) {
        proteinGrams = Math.round((targetCalories * 0.35) / 4);
    }

    // Grasas: ~0.8g - 1g por kg, o el 25-30% de las calorías
    // Usaremos el 30% como base saludable hormonalmente
    const fatCals = Math.round(targetCalories * 0.30);
    const fatGrams = Math.round(fatCals / 9);

    // Carbohidratos: El resto
    const usedCals = (proteinGrams * 4) + (fatGrams * 9);
    const remainingCals = targetCalories - usedCals;
    const carbGrams = Math.max(0, Math.round(remainingCals / 4));

    // 6. Azúcares
    // OMS recomienda < 10% de la ingesta calórica total, idealmente < 5%.
    // Vamos a ser estrictos pero realistas: Máximo 5% para salud óptima o tope fijo.
    const sugarCap = Math.min(Math.round((targetCalories * 0.05) / 4), 30); // Max 30g o 5%

    const result = {
      calories: Math.round(targetCalories),
      protein: proteinGrams,
      carbs: carbGrams,
      fats: fatGrams,
      sugars: sugarCap
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in calculate-macros function:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});