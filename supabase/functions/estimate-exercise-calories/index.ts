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
    const { name, duration, weight } = await req.json();
    if (!name || !duration) {
      return new Response(JSON.stringify({ error: "name and duration are required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const prompt = `
      Eres una IA experta en fitness. Estima las calorías quemadas para el ejercicio descrito.
      Datos:
      - Ejercicio: "${name}"
      - Duración: ${duration} minutos
      - Peso (kg): ${weight ?? 'desconocido'}

      Reglas:
      - Si el peso no está disponible, asume 70 kg como referencia.
      - Responde SOLO con JSON válido:
      {
        "calories": number
      }
      - Redondea al entero más cercano.
    `;

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    };

    const aiRes = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!aiRes.ok) {
      const text = await aiRes.text();
      console.error("Gemini error:", text);
      throw new Error(aiRes.statusText);
    }

    const aiData = await aiRes.json();
    const jsonText = aiData.candidates?.[0]?.content?.parts?.[0]?.text ?? '{"calories": 0}';

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