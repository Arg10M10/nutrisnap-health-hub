import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`;

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { foodName, description, portionSize } = await req.json();
    if (!foodName || !portionSize) {
      return new Response(JSON.stringify({ error: "El nombre y el tamaño de la porción son requeridos." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const prompt = `
      Analiza esta comida basándote en su nombre, una descripción opcional y el tamaño de la porción.
      - Nombre: "${foodName}"
      - Descripción del usuario (para darte contexto): "${description || 'No proporcionada'}"
      - Tamaño de la porción: "${portionSize}"
      
      Proporciona una estimación razonable de sus valores nutricionales.
      Responde únicamente con un objeto JSON válido, sin ningún texto adicional antes o después.
      El objeto JSON debe tener la siguiente estructura:
      {
        "foodName": "${foodName}",
        "calories": "Estimación de calorías (ej. '350-450 kcal')",
        "protein": "Estimación de proteínas (ej. '20-25g')",
        "carbs": "Estimación de carbohidratos (ej. '30-40g')",
        "fats": "Estimación de grasas (ej. '15-20g')",
        "sugars": "Estimación de azúcares (ej. '10-15g')",
        "healthRating": "Clasificación de salud ('Saludable', 'Moderado', o 'Evitar')",
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

    if (!responseData.candidates || responseData.candidates.length === 0) {
      console.error("Respuesta de la IA inválida o bloqueada:", responseData);
      const blockReason = responseData.promptFeedback?.blockReason || "desconocida";
      throw new Error(`La IA no pudo procesar la solicitud (motivo: ${blockReason}).`);
    }

    const jsonText = responseData.candidates[0].content.parts[0].text;
    const analysisResult = safeParseJson(jsonText);

    if (!analysisResult) {
      throw new Error("La IA devolvió una respuesta en un formato inesperado.");
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error en la función Edge:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});