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
    const { description, weight } = await req.json();
    if (!description) {
      return new Response(JSON.stringify({ error: "Description is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const prompt = `
      Eres una IA experta en fitness. Analiza la descripción de un ejercicio y extrae el nombre, la duración en minutos y estima las calorías quemadas.
      Datos del usuario:
      - Descripción: "${description}"
      - Peso (kg): ${weight ?? '70'} (Usa 70kg como referencia si no se proporciona)

      Reglas:
      1. Extrae el nombre del ejercicio principal. Sé conciso (ej. "Yoga", "Correr", "Entrenamiento de fuerza").
      2. Extrae la duración total en minutos. Si se da un rango, usa el promedio. Si no se especifica, haz una estimación razonable.
      3. Estima las calorías quemadas basándote en el ejercicio, duración, intensidad implícita y peso.
      4. Responde SOLO con un objeto JSON válido con la siguiente estructura, sin texto adicional:
      {
        "name": "string",
        "duration": number,
        "calories": number
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
      const text = await aiRes.text();
      console.error("GPT error:", text);
      throw new Error(aiRes.statusText);
    }

    const aiData = await aiRes.json();
    const jsonText = aiData.choices?.[0]?.message?.content ?? "";

    return new Response(jsonText, {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    console.error("estimate-exercise-calories error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});