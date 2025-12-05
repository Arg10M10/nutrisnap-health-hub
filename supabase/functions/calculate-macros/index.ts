import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Ahora usamos la clave de OpenAI y el modelo gpt-5-nano
const GPT_API_KEY = Deno.env.get("OPENAI_API_KEY");
const GPT_API_URL = Deno.env.get("GPT_API_URL") ?? "";
const GPT_MODEL = "gpt-5-nano";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { gender, age, height, weight, workoutsPerWeek, goal, goalWeight, weeklyRate } = await req.json();

    const prompt = `
      You are an expert nutritionist AI. Based on the user's data, calculate their optimal daily nutritional goals.

      User Data:
      - Gender: ${gender}
      - Age: ${age} years
      - Height: ${height} cm
      - Current Weight: ${weight} kg
      - Workouts per week: ${workoutsPerWeek}
      - Primary Goal: ${goal}
      - Goal Weight: ${goalWeight} kg
      - Desired weekly change: ${weeklyRate} kg

      Instructions:
      1.  Calculate Basal Metabolic Rate (BMR) using the Mifflin-St Jeor equation.
          - Men: BMR = 10 * weight (kg) + 6.25 * height (cm) - 5 * age (y) + 5
          - Women: BMR = 10 * weight (kg) + 6.25 * height (cm) - 5 * age (y) - 161
      2.  Calculate Total Daily Energy Expenditure (TDEE) by applying an activity multiplier to the BMR.
          - 0-1 workouts/week: 1.2 (Sedentary)
          - 2-3 workouts/week: 1.375 (Lightly active)
          - 4-5 workouts/week: 1.55 (Moderately active)
          - 6-7 workouts/week: 1.725 (Very active)
      3.  Adjust TDEE for the user's goal. A 1 kg change per week is roughly 1100 kcal/day. Adjust proportionally for the user's desired weekly rate.
          - For 'lose_weight', subtract calories.
          - For 'gain_weight', add calories.
          - For 'maintain_weight', use TDEE as is.
      4.  Distribute the final daily calories into macronutrients (protein, carbs, fats) using balanced ratios. A good starting point is 40% carbs, 30% protein, 30% fats. Protein should be at least 1.6g per kg of body weight.
      5.  Set a reasonable daily sugar limit, generally under 10% of total calories (e.g., 25-50g).
      6.  Round all final values to the nearest whole number.

      Respond ONLY with a valid JSON object with the following structure, without any extra text or markdown formatting:
      {
        "calories": number,
        "protein": number,
        "carbs": number,
        "fats": number,
        "sugars": number
      }
    `;

    const body = {
      model: GPT_MODEL,
      input: prompt,
      response_format: { type: "json_object" },
    };

    const aiRes = await fetch(GPT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${GPT_API_KEY}` },
      body: JSON.stringify(body),
    });

    if (!aiRes.ok) {
      const errorBody = await aiRes.text();
      console.error("Error from GPT API:", errorBody);
      throw new Error(`Error from AI API: ${aiRes.statusText}`);
    }

    const aiData = await aiRes.json();
    const jsonText = aiData.output ?? JSON.stringify(aiData);

    return new Response(jsonText, {
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