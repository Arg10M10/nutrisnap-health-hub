import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GPT_API_KEY = Deno.env.get("OPENAI_API_KEY");
const GPT_API_URL = "https://api.openai.com/v1/chat/completions";
const GPT_MODEL = "gpt-4o-mini";

const safeParseJson = (text: string) => {
  try {
    return JSON.parse(text);
  } catch {
    const cleanedText = text.replace(/```json\n/g, "").replace(/\n```/g, "").trim();
    try {
      return JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse JSON even after cleaning:", e);
      console.error("Original text:", text);
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

  const { entry_id, foodName, description, portionSize, language } = await req.json();
  if (!entry_id || !foodName || !portionSize) {
    return new Response(JSON.stringify({ error: "entry_id, foodName, and portionSize are required." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }

  const userLang = language && language.startsWith('es') ? 'Español' : 'Inglés';

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const prompt = `
      Analiza esta comida basándote en su nombre, descripción y porción.
      - Nombre: "${foodName}"
      - Descripción: "${description || 'No proporcionada'}"
      - Tamaño: "${portionSize}"
      
      Responde ÚNICAMENTE con un objeto JSON.
      IMPORTANTE: Todos los textos explicativos deben estar en ${userLang}.

      Estructura JSON:
      {
        "foodName": "${foodName}",
        "calories": "Estimación (ej. '350-450 kcal')",
        "protein": "Estimación (ej. '20-25g')",
        "carbs": "Estimación (ej. '30-40g')",
        "fats": "Estimación (ej. '15-20g')",
        "sugars": "Estimación (ej. '5-10g')",
        "healthRating": "Clasificación ('Saludable', 'Moderado', 'Evitar' - en ${userLang})",
        "reason": "Explicación breve (máx 20 palabras, en ${userLang})."
      }
    `;

    const body = {
      model: GPT_MODEL,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
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
      throw new Error(`Error en la API de IA: ${aiRes.statusText}`);
    }

    const aiData = await aiRes.json();
    const jsonText = aiData.choices?.[0]?.message?.content ?? "";
    const analysisResult = safeParseJson(jsonText);
    if (!analysisResult) throw new Error("La IA devolvió una respuesta en un formato inesperado.");

    const { error: updateError } = await supabaseAdmin
      .from('food_entries')
      .update({
        calories: analysisResult.calories,
        protein: analysisResult.protein,
        carbs: analysisResult.carbs,
        fats: analysisResult.fats,
        sugars: analysisResult.sugars,
        health_rating: analysisResult.healthRating,
        reason: analysisResult.reason,
        calories_value: parseNutrientValue(analysisResult.calories),
        protein_value: parseNutrientValue(analysisResult.protein),
        carbs_value: parseNutrientValue(analysisResult.carbs),
        fats_value: parseNutrientValue(analysisResult.fats),
        sugars_value: parseNutrientValue(analysisResult.sugars),
        status: 'completed',
      })
      .eq('id', entry_id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error en la función Edge:", error);
    await supabaseAdmin
      .from('food_entries')
      .update({ status: 'failed', reason: (error as Error).message })
      .eq('id', entry_id);

    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});