import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { name, nutrients } = await req.json();
    if (!name || !nutrients) {
      return new Response(JSON.stringify({ error: "Product name and nutrients are required." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const prompt = `
      Basado en la siguiente información nutricional para "${name}", por cada 100g:
      - Calorías: ${nutrients.calories || 'N/A'} kcal
      - Proteínas: ${nutrients.protein || 'N/A'} g
      - Carbohidratos: ${nutrients.carbs || 'N/A'} g
      - Grasas: ${nutrients.fats || 'N/A'} g

      Proporciona una clasificación de salud y una breve razón.
      Responde únicamente con un objeto JSON válido con la siguiente estructura:
      {
        "healthRating": "Clasificación ('Saludable', 'Moderado', o 'Evitar')",
        "reason": "Una breve explicación (máximo 20 palabras) de por qué le diste esa clasificación."
      }
    `;

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    };

    const geminiResponse = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      console.error("Error from Gemini API:", errorBody);
      throw new Error(`Error en la API de IA: ${geminiResponse.statusText}`);
    }

    const responseData = await geminiResponse.json();
    const jsonText = responseData.candidates[0].content.parts[0].text;
    
    return new Response(jsonText, {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in rate-food-product function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});