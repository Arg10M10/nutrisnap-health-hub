import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GPT_API_KEY = Deno.env.get("OPENAI_API_KEY");
const GPT_API_URL = "https://api.openai.com/v1/chat/completions";
const GPT_MODEL = "gpt-5-nano";

const safeParseJson = (text: string) => {
  try {
    const cleanedText = text.replace(/```json\n?/g, "").replace(/\n?```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (e) {
    console.error("Failed to parse JSON from AI:", e);
    return null;
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { weight, height, gender, age, goal, goalWeight, weeklyRate, workoutsPerWeek } = await req.json();

    const prompt = `
      You are an elite nutritionist AI. Your task is to calculate the PERFECT daily nutritional targets for a user.
      
      User Profile:
      - Current Weight: ${weight} kg
      - Height: ${height} cm
      - Age: ${age} years
      - Gender: ${gender}
      - Activity Level (workouts/week): ${workoutsPerWeek}
      - Main Goal: ${goal} (lose_weight, maintain_weight, gain_weight)
      - Target Weight: ${goalWeight} kg
      - Desired Weekly Pace: ${weeklyRate} kg/week

      INSTRUCTIONS:
      1. Calculate BMR and TDEE scientifically.
      2. Adjust calories for the specific goal and weekly pace (ensure it's safe/realistic).
      3. Distribute macros (Protein, Carbs, Fats) optimally for muscle retention/growth based on the goal.
      4. Set a sugar limit (recommended < 10% calories or fixed low amount).
      5. **Return ONLY valid JSON** with these integer values:
      
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
    const result = safeParseJson(jsonText);

    if (!result || !result.calories || !result.protein) {
      throw new Error("Invalid AI response structure");
    }

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