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
    const { imageData, goal, weeklyRate, language } = await req.json();

    if (!imageData) {
      throw new Error("Image data is required");
    }

    const userLang = language && language.startsWith('es') ? 'Spanish' : 'English';
    
    // Traducir objetivos para el contexto de la IA
    let goalContext = "maintain a healthy weight";
    if (goal === 'lose_weight') goalContext = `lose weight at a rate of ${weeklyRate || 0.5}kg per week`;
    else if (goal === 'gain_weight') goalContext = `gain muscle/weight at a rate of ${weeklyRate || 0.5}kg per week`;

    const prompt = `
      You are an expert nutritionist assisting a user who wants to ${goalContext}.
      Analyze the provided image of a food menu.
      
      Task:
      1. Identify the food items listed on the menu.
      2. Select the Top 3-4 HEALTHIEST options aligned with the user's goal.
      3. Identify 1-2 options to AVOID or consume in moderation (high calorie/sugar/bad fats).
      4. Provide a very brief explanation for each choice.
      
      Constraints:
      - Keep the list SHORT and concise. Do not list everything.
      - Output language MUST be ${userLang}.
      - Return ONLY valid JSON.
      
      JSON Structure:
      {
        "recommended": [
          { "name": "Dish Name", "calories": "Est. ~500kcal", "reason": "Why it's good (max 10 words)" }
        ],
        "avoid": [
          { "name": "Dish Name", "calories": "Est. ~1200kcal", "reason": "Why avoid it (max 10 words)" }
        ],
        "summary": "One sentence summary advice for this menu."
      }
    `;

    // Limpiar base64 si trae prefijo
    const base64Image = imageData.includes('base64,') ? imageData.split('base64,')[1] : imageData;

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
      max_tokens: 1000,
    };

    const aiRes = await fetch(GPT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${GPT_API_KEY}` },
      body: JSON.stringify(body),
    });

    if (!aiRes.ok) {
      const errorText = await aiRes.text();
      console.error("OpenAI Error:", errorText);
      throw new Error(`OpenAI API Error: ${aiRes.statusText}`);
    }

    const aiData = await aiRes.json();
    const content = aiData.choices?.[0]?.message?.content;
    
    if (!content) throw new Error("No content returned from AI");

    const parsedData = JSON.parse(content);

    return new Response(JSON.stringify(parsedData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in analyze-menu:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});