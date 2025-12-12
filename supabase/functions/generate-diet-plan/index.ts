import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GPT_API_KEY = Deno.env.get("OPENAI_API_KEY");
const GPT_API_URL = "https://api.openai.com/v1/chat/completions";
const GPT_MODEL = "gpt-5-nano";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { goal, activityLevel, preferences, cookingTime, budget, language } = await req.json();

    const targetLanguage = language && language.startsWith('es') ? 'Spanish' : 'English';

    const prompt = `
      You are an expert nutritionist AI. Create a personalized weekly meal plan based on the user's data.

      User Profile:
      - Main Goal: ${goal} (lose_weight, maintain_weight, or gain_weight)
      - Activity Level: ${activityLevel}
      - Dietary Preferences: ${preferences.join(', ')}
      - Cooking Time Availability: ${cookingTime}
      - Budget: ${budget}

      CRITICAL INSTRUCTION:
      The user's preferred language is ${targetLanguage}. 
      All names of meals and descriptions MUST be written in ${targetLanguage}.

      Instructions:
      1. Generate a meal plan for 7 days (Monday to Sunday).
      2. For each day, include breakfast, lunch, dinner, and a snack.
      3. Meals must be varied, healthy, and aligned with user goals.
      4. Provide simple and realistic meal ideas compatible with the cooking time and budget.
      5. Respond ONLY with a valid JSON object, no extra text or markdown. Use this exact structure:
      {
        "monday": { "breakfast": "...", "lunch": "...", "dinner": "...", "snack": "..." },
        "tuesday": { "breakfast": "...", "lunch": "...", "dinner": "...", "snack": "..." },
        "wednesday": { "breakfast": "...", "lunch": "...", "dinner": "...", "snack": "..." },
        "thursday": { "breakfast": "...", "lunch": "...", "dinner": "...", "snack": "..." },
        "friday": { "breakfast": "...", "lunch": "...", "dinner": "...", "snack": "..." },
        "saturday": { "breakfast": "...", "lunch": "...", "dinner": "...", "snack": "..." },
        "sunday": { "breakfast": "...", "lunch": "...", "dinner": "...", "snack": "..." }
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