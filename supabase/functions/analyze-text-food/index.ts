import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GPT_API_KEY = Deno.env.get("OPENAI_API_KEY");
const GPT_API_URL = "https://api.openai.com/v1/chat/completions";
const GPT_MODEL = "gpt-5-nano";

const safeParseJson = (text: string) => {
  try {
    return JSON.parse(text);
  } catch {
    const cleanedText = text.replace(/```json\n/g, "").replace(/\n```/g, "").trim();
    try {
      return JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse JSON even after cleaning:", e);
      return null;
    }
  }
};

const parseNutrientValue = (value: string | null): number => {
  if (!value) return 0;
  const numbers = value.match(/\d+/g)?.map(Number) || [];
  if (numbers.length === 0) return 0;
  if (numbers.length === 1) return numbers[0];
  return (numbers[0] + numbers[1]) / 2;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { entry_id, foodName, description, portionSize } = await req.json();
    
    if (!foodName || !portionSize) {
      return new Response(JSON.stringify({ error: "foodName and portionSize are required." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const prompt = `
      Analyze this meal based on its name, description, and portion size.
      - Name: "${foodName}"
      - Description: "${description || 'Not provided'}"
      - Size: "${portionSize}"
      
      Respond ONLY with a JSON object.
      IMPORTANT: All explanatory texts must be in English.

      JSON Structure:
      {
        "foodName": "${foodName}",
        "calories": "Estimate (e.g., '350-450 kcal')",
        "protein": "Estimate (e.g., '20-25g')",
        "carbs": "Estimate (e.g., '30-40g')",
        "fats": "Estimate (e.g., '15-20g')",
        "sugars": "Estimate (e.g., '5-10g')",
        "fiber": "Estimate (e.g., '5-10g')",
        "healthRating": "Classification ('Healthy', 'Moderate', 'Avoid')",
        "reason": "Brief explanation (max 20 words, in English)."
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
      throw new Error(`Error in AI API: ${aiRes.statusText}`);
    }

    const aiData = await aiRes.json();
    const jsonText = aiData.choices?.[0]?.message?.content ?? "";
    const analysisResult = safeParseJson(jsonText);
    
    if (!analysisResult) throw new Error("The AI returned a response in an unexpected format.");

    // If there is an entry_id, update the database (behavior for manual entry)
    if (entry_id) {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { error: updateError } = await supabaseAdmin
        .from('food_entries')
        .update({
          calories: analysisResult.calories,
          protein: analysisResult.protein,
          carbs: analysisResult.carbs,
          fats: analysisResult.fats,
          sugars: analysisResult.sugars,
          fiber: analysisResult.fiber,
          health_rating: analysisResult.healthRating,
          reason: analysisResult.reason,
          calories_value: parseNutrientValue(analysisResult.calories),
          protein_value: parseNutrientValue(analysisResult.protein),
          carbs_value: parseNutrientValue(analysisResult.carbs),
          fats_value: parseNutrientValue(analysisResult.fats),
          sugars_value: parseNutrientValue(analysisResult.sugars),
          fiber_value: parseNutrientValue(analysisResult.fiber),
          status: 'completed',
        })
        .eq('id', entry_id);

      if (updateError) throw updateError;
    }

    // Always return the result so the frontend can use it directly
    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in Edge function:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});