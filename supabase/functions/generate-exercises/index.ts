import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { age, objective } = await req.json();

    if (!age || !objective) {
      return new Response(JSON.stringify({ error: "Faltan la edad o el objetivo." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `
      Eres un experto en fitness y nutrición.
      Genera 2 recomendaciones de ejercicios personalizadas para una persona de ${age} años cuyo objetivo es "${objective}".
      Responde ÚNICAMENTE con un array JSON de objetos. No incluyas texto introductorio, explicaciones ni la palabra "json".
      Cada objeto debe tener exactamente las siguientes claves:
      - "name": string (nombre del ejercicio)
      - "duration": number (duración en minutos)
      - "calories": number (calorías quemadas aproximadas)
      - "intensity": string (valores posibles: "Baja", "Media", "Alta", "Muy Baja")

      Ejemplo de respuesta esperada:
      [
        {
          "name": "Caminata Rápida",
          "duration": 30,
          "calories": 150,
          "intensity": "Baja"
        },
        {
          "name": "Yoga Suave",
          "duration": 25,
          "calories": 80,
          "intensity": "Muy Baja"
        }
      ]
    `;

    const geminiResponse = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: "application/json",
        },
      }),
    });

    if (!geminiResponse.ok) {
      throw new Error(`Error en la API de Gemini: ${geminiResponse.statusText}`);
    }

    const geminiData = await geminiResponse.json();
    const exercisesText = geminiData.candidates[0].content.parts[0].text;
    
    // A veces la IA puede devolver el JSON dentro de un bloque de código markdown, lo limpiamos.
    const cleanedJsonText = exercisesText.replace(/```json\n|```/g, "").trim();
    const exercises = JSON.parse(cleanedJsonText);

    return new Response(JSON.stringify(exercises), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});