import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GPT_API_KEY = Deno.env.get("OPENAI_API_KEY");
const GPT_API_URL = "https://api.openai.com/v1/chat/completions";
const GPT_MODEL = "gpt-4o-mini";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { goal, activityLevel, preferences, cookingTime, budget, language, country } = await req.json();

    const targetLanguage = language && language.startsWith('es') ? 'Spanish' : 'English';
    const userCountry = country || 'their location';

    const prompt = `
      You are an expert nutritionist AI. Create a personalized weekly meal plan based on the user's data.

      User Profile:
      - Main Goal: ${goal} (lose_weight, maintain_weight, or gain_weight)
      - Activity Level: ${activityLevel}
      - Dietary Preferences: ${preferences.join(', ')}
      - Cooking Time Availability: ${cookingTime}
      - Budget: ${budget}
      - Country/Region: ${userCountry}

      CRITICAL INSTRUCTIONS:
      1. The user's preferred language is ${targetLanguage}. All meal names MUST be written in ${targetLanguage}.
      2. **ADAPT TO THE COUNTRY**: Prioritize dishes, ingredients, and culinary styles typical of ${userCountry}. Make it feel local and culturally relevant.
      3. For each day, include breakfast, lunch, dinner, and a snack.
      4. For EACH meal, provide the meal name and an estimation of its nutritional values: calories (kcal), protein (g), carbs (g), and fats (g). All values must be numbers.
      5. Meals must be varied, healthy, and aligned with user goals.
      6. Provide simple and realistic meal ideas compatible with the cooking time and budget.
      7. Respond ONLY with a valid JSON object, no extra text or markdown. Use this exact structure:
      {
        "monday": {
          "breakfast": { "name": "...", "calories": number, "protein": number, "carbs": number, "fats": number },
          "lunch": { "name": "...", "calories": number, "protein": number, "carbs": number, "fats": number },
          "dinner": { "name": "...", "calories": number, "protein": number, "carbs": number, "fats": number },
          "snack": { "name": "...", "calories": number, "protein": number, "carbs": number, "fats": number }
        },
        "tuesday": { "breakfast": { "name": "...", "calories": number, "protein": number, "carbs": number, "fats": number }, "lunch": { "name": "...", "calories": number, "protein": number, "carbs": number, "fats": number }, "dinner": { "name": "...", "calories": number, "protein": number, "carbs": number, "fats": number }, "snack": { "name": "...", "calories": number, "protein": number, "carbs": number, "fats": number } },
        "wednesday": { "breakfast": { "name": "...", "calories": number, "protein": number, "carbs": number, "fats": number }, "lunch": { "name": "...", "calories": number, "protein": number, "carbs": number, "fats": number }, "dinner": { "name": "...", "calories": number, "protein": number, "carbs": number, "fats": number }, "snack": { "name": "...", "calories": number, "protein": number, "carbs": number, "fats": number } },
        "thursday": { "breakfast": { "name": "...", "calories": number, "protein": number, "carbs": number, "fats": number }, "lunch": { "name": "...", "calories": number, "protein": number, "carbs": number, "fats": number }, "dinner": { "name": "...", "calories": number, "protein": number, "carbs": number, "fats": number }, "snack": { "name": "...", "calories": number, "protein": number, "carbs": number, "fats": number } },
        "friday": { "breakfast": { "name": "...", "calories": number, "protein": number, "carbs": number, "fats": number }, "lunch": { "name": "...", "calories": number, "protein": number, "carbs": number, "fats": number }, "dinner": { "name": "...", "calories": number, "protein": number, "carbs": number, "fats": number }, "snack": { "name": "...", "calories": number, "protein": number, "carbs": number, "fats": number } },
        "saturday": { "breakfast": { "name": "...", "calories": number, "protein": number, "carbs": number, "fats": number }, "lunch": { "name": "...", "calories": number, "protein": number, "carbs": number, "fats": number }, "dinner": { "name": "...", "calories": number, "protein": number, "carbs": number, "fats": number }, "snack": { "name": "...", "calories": number, "protein": number, "carbs": number, "fats": number } },
        "sunday": { "breakfast": { "name": "...", "calories": number, "protein": number, "carbs": number, "fats": number }, "lunch": { "name": "...", "calories": number, "protein": number, "carbs": number, "fats": number }, "dinner": { "name": "...", "calories": number, "protein": number, "carbs": number, "fats": number }, "snack": { "name": "...", "calories": number, "protein": number, "carbs": number, "fats": number } }
      }
    `;

    const body = {
      model: GPT_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    };

    const aiRes = await fetch(GPT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${GPT_API_KEY}` },
      body: JSON.stringify(body),
    });

    if (!aiRes.ok) {
      const errorBody = await aiRes.text();
      throw new Error(`AI API Error: ${errorBody}`);
    }

    const aiData = await aiRes.json();
    const jsonText = aiData.choices?.[0]?.message?.content ?? "{}";

    return new Response(jsonText, {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});