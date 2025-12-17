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
    const targetWeeklyChange = Number(weeklyRate) || 0; // kg por semana (0 si es mantener)

    // 2. Cálculo de BMR (Tasa Metabólica Basal) - Ecuación Mifflin-St Jeor
    let bmr = (10 * safeWeight) + (6.25 * safeHeight) - (5 * safeAge);
    bmr += isMale ? 5 : -161;

    // 3. Multiplicador de Actividad (TDEE)
    let activityMultiplier = 1.2; // Sedentario base
    if (safeWorkouts >= 1 && safeWorkouts <= 2) activityMultiplier = 1.375; // Ligero
    else if (safeWorkouts >= 3 && safeWorkouts <= 5) activityMultiplier = 1.55; // Moderado
    else if (safeWorkouts >= 6) activityMultiplier = 1.725; // Intenso

    const tdee = Math.round(bmr * activityMultiplier);

    // 4. Ajuste por Objetivo (Déficit/Superávit)
    // 1kg de grasa corporal ≈ 7700 kcal.
    const dailyCalorieDelta = Math.round((targetWeeklyChange * 7700) / 7);
    
    let targetCalories = tdee;

    if (goal === 'lose_weight') {
      targetCalories = tdee - dailyCalorieDelta;
      const minSafeCalories = isMale ? 1500 : 1200;
      if (targetCalories < minSafeCalories) targetCalories = minSafeCalories;
    } else if (goal === 'gain_weight') {
      targetCalories = tdee + dailyCalorieDelta;
    }

    // 5. Distribución de Macros
    // Proteína: ~2g por kg de peso
    let proteinGrams = Math.round(safeWeight * 2); 
    const proteinCals = proteinGrams * 4;

    // Seguridad: Que proteína no sea excesiva (>40% cals)
    if (proteinCals > (targetCalories * 0.4)) {
        proteinGrams = Math.round((targetCalories * 0.35) / 4);
    }

    // Grasas: ~30% de las calorías
    const fatCals = Math.round(targetCalories * 0.30);
    const fatGrams = Math.round(fatCals / 9);

    // Carbohidratos: El resto
    const usedCals = (proteinGrams * 4) + (fatGrams * 9);
    const remainingCals = targetCalories - usedCals;
    const carbGrams = Math.max(0, Math.round(remainingCals / 4));

    // 6. Azúcares: Tope estricto del 5%
    const sugarCap = Math.min(Math.round((targetCalories * 0.05) / 4), 30);

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