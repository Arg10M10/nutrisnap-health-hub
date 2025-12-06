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
  return numbers[0] || 0;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { product } = await req.json();
    if (!product) {
      throw new Error("Product data is required.");
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("User not found.");

    const nutriments = product.nutriments || {};
    const productInfo = {
      name: product.product_name || 'Nombre no disponible',
      imageUrl: product.image_url || null,
      calories: nutriments['energy-kcal_100g'] || 0,
      protein: nutriments.proteins_100g || 0,
      carbs: nutriments.carbohydrates_100g || 0,
      fats: nutriments.fat_100g || 0,
      sugars: nutriments.sugars_100g || 0,
    };

    const prompt = `
      Basado en la siguiente información nutricional para "${productInfo.name}" (por 100g):
      - Calorías: ${productInfo.calories} kcal
      - Proteínas: ${productInfo.protein} g
      - Carbohidratos: ${productInfo.carbs} g
      - Grasas: ${productInfo.fats} g
      - Azúcares: ${productInfo.sugars} g
      Proporciona una clasificación de salud y una breve razón.
      Responde ÚNICAMENTE con un objeto JSON: {"healthRating": "...", "reason": "..."}
    `;

    const aiRes = await fetch(GPT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${GPT_API_KEY}` },
      body: JSON.stringify({
        model: GPT_MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) throw new Error(`AI API error: ${aiRes.statusText}`);
    const aiData = await aiRes.json();
    const ratingResult = JSON.parse(aiData.choices?.[0]?.message?.content ?? "{}");

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error } = await supabaseAdmin.from('food_entries').insert({
      user_id: user.id,
      food_name: productInfo.name,
      image_url: productInfo.imageUrl,
      calories: `${Math.round(productInfo.calories)} kcal`,
      protein: `${productInfo.protein.toFixed(1)}g`,
      carbs: `${productInfo.carbs.toFixed(1)}g`,
      fats: `${productInfo.fats.toFixed(1)}g`,
      sugars: `${productInfo.sugars.toFixed(1)}g`,
      health_rating: ratingResult.healthRating,
      reason: ratingResult.reason,
      calories_value: parseNutrientValue(productInfo.calories),
      protein_value: parseNutrientValue(productInfo.protein),
      carbs_value: parseNutrientValue(productInfo.carbs),
      fats_value: parseNutrientValue(productInfo.fats),
      sugars_value: parseNutrientValue(productInfo.sugars),
      status: 'completed',
      barcode: product.code,
    });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in process-openfoodfacts-data:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});