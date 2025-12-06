import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GPT_API_KEY = Deno.env.get("OPENAI_API_KEY");
const GPT_API_URL = "https://api.openai.com/v1/chat/completions";
const GPT_MODEL = "gpt-5-nano";

const parseNutrientValue = (value: string | number | null): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const numbers = String(value).match(/\d+/g)?.map(Number) || [];
  if (numbers.length === 0) return 0;
  if (numbers.length === 1) return numbers[0];
  return (numbers[0] + numbers[1]) / 2;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { entry_id, barcode } = await req.json();
  if (!entry_id || !barcode) {
    return new Response(JSON.stringify({ error: "entry_id and barcode are required." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // 1. Fetch from OpenFoodFacts
    const offResponse = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
    if (!offResponse.ok) {
      throw new Error(`Failed to fetch from OpenFoodFacts API: ${offResponse.statusText}`);
    }
    const offData = await offResponse.json();

    if (offData.status === 0) {
      throw new Error("Producto no encontrado en la base de datos.");
    }

    const product = offData.product;
    const nutriments = product.nutriments || {};

    const productInfo = {
      name: product.product_name || 'Nombre no disponible',
      imageUrl: product.image_url || null,
      nutrients: {
        calories: nutriments['energy-kcal_100g'] || 0,
        fats: nutriments.fat_100g || 0,
        carbs: nutriments.carbohydrates_100g || 0,
        protein: nutriments.proteins_100g || 0,
        sugars: nutriments.sugars_100g || 0,
      }
    };

    // 2. Get AI Rating
    const prompt = `
      Basado en la siguiente información nutricional para "${productInfo.name}", por cada 100g:
      - Calorías: ${productInfo.nutrients.calories || 'N/A'} kcal
      - Proteínas: ${productInfo.nutrients.protein || 'N/A'} g
      - Carbohidratos: ${productInfo.nutrients.carbs || 'N/A'} g
      - Grasas: ${productInfo.nutrients.fats || 'N/A'} g
      - Azúcares: ${productInfo.nutrients.sugars || 'N/A'} g

      Proporciona una clasificación de salud y una breve razón.
      Responde únicamente con un objeto JSON válido con la siguiente estructura:
      {
        "healthRating": "Clasificación ('Saludable', 'Moderado', o 'Evitar')",
        "reason": "Una breve explicación (máximo 20 palabras) de por qué le diste esa clasificación."
      }
    `;

    const aiBody = {
      model: GPT_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    };

    const aiRes = await fetch(GPT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${GPT_API_KEY}` },
      body: JSON.stringify(aiBody),
    });

    if (!aiRes.ok) {
      throw new Error(`Error en la API de IA: ${aiRes.statusText}`);
    }

    const aiData = await aiRes.json();
    const ratingResult = JSON.parse(aiData.choices?.[0]?.message?.content ?? "{}");

    // 3. Update Supabase entry
    const { error: updateError } = await supabaseAdmin
      .from('food_entries')
      .update({
        food_name: productInfo.name,
        image_url: productInfo.imageUrl,
        calories: `${Math.round(productInfo.nutrients.calories)} kcal`,
        protein: `${productInfo.nutrients.protein.toFixed(1)}g`,
        carbs: `${productInfo.nutrients.carbs.toFixed(1)}g`,
        fats: `${productInfo.nutrients.fats.toFixed(1)}g`,
        sugars: `${productInfo.nutrients.sugars.toFixed(1)}g`,
        health_rating: ratingResult.healthRating,
        reason: ratingResult.reason,
        calories_value: parseNutrientValue(productInfo.nutrients.calories),
        protein_value: parseNutrientValue(productInfo.nutrients.protein),
        carbs_value: parseNutrientValue(productInfo.nutrients.carbs),
        fats_value: parseNutrientValue(productInfo.nutrients.fats),
        sugars_value: parseNutrientValue(productInfo.nutrients.sugars),
        status: 'completed',
      })
      .eq('id', entry_id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error en la función process-barcode:", error);
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