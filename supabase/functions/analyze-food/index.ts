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

  const { entry_id, imageData } = await req.json();
  if (!entry_id || !imageData) {
    return new Response(JSON.stringify({ error: "entry_id and imageData are required." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const base64Image = imageData.split(",")[1];
    const prompt = `
      Analiza la imagen. Tu primera prioridad es detectar un código de barras.
      
      1. Si la imagen contiene un código de barras claro y legible, extrae el número y responde ÚNICAMENTE con un objeto JSON con la siguiente estructura:
         {"barcode": "EL_NUMERO_DEL_CODIGO_DE_BARRAS"}

      2. Si NO hay un código de barras legible, analiza la comida en la imagen y proporciona una estimación nutricional. Responde ÚNICAMENTE con un objeto JSON con la siguiente estructura:
         {
           "foodName": "Nombre del plato",
           "calories": "Estimación de calorías (ej. '350-450 kcal')",
           "protein": "Estimación de proteínas (ej. '20-25g')",
           "carbs": "Estimación de carbohidratos (ej. '30-40g')",
           "fats": "Estimación de grasas (ej. '15-20g')",
           "sugars": "Estimación de azúcares (ej. '5-10g')",
           "healthRating": "Clasificación ('Saludable', 'Moderado', o 'Evitar')",
           "reason": "Breve explicación (máx 20 palabras)."
         }
    `;

    const body = {
      model: GPT_MODEL,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
          ],
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
      throw new Error(`Error en la API de IA: ${errorBody}`);
    }

    const aiData = await aiRes.json();
    const jsonText = aiData.choices?.[0]?.message?.content ?? "";
    const analysisResult = safeParseJson(jsonText);

    if (!analysisResult) {
      throw new Error("La IA devolvió una respuesta en un formato inesperado.");
    }

    // SI SE DETECTA UN CÓDIGO DE BARRAS
    if (analysisResult.barcode) {
      const { error: invokeError } = await supabaseAdmin.functions.invoke('process-barcode', {
        body: { entry_id, barcode: analysisResult.barcode },
      });
      if (invokeError) {
        throw new Error(`Error al procesar el código de barras: ${invokeError.message}`);
      }
    } 
    // SI ES UN ANÁLISIS VISUAL DE COMIDA
    else {
      const { error: updateError } = await supabaseAdmin
        .from('food_entries')
        .update({
          food_name: analysisResult.foodName,
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
    }

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