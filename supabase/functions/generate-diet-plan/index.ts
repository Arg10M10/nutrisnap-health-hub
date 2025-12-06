import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    const { goal, activityLevel, preferences, cookingTime, budget } = await req.json();

    const prompt = `
      Eres un nutricionista experto. Crea un plan de comidas semanal personalizado para un usuario con los siguientes datos:
      - Objetivo principal: ${goal} (lose_weight: perder peso, maintain_weight: mantener, gain_weight: ganar)
      - Nivel de actividad: ${activityLevel}
      - Preferencias dietéticas: ${preferences.join(', ')}
      - Tiempo para cocinar: ${cookingTime}
      - Presupuesto: ${budget}

      Instrucciones:
      1. Genera un plan de comidas para 7 días (de lunes a domingo).
      2. Para cada día, incluye desayuno, almuerzo, cena y un snack.
      3. Las comidas deben ser variadas, saludables y alineadas con el objetivo, preferencias y restricciones del usuario.
      4. Proporciona ideas de comidas simples y realistas según el tiempo de cocina y presupuesto.
      5. Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional. La estructura debe ser:
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
      throw new Error(`Error de la API de IA: ${errorBody}`);
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