import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    try {
      const cleanedText = text.replace(/```json\n?/g, "").replace(/\n?```/g, "").trim();
      return JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse JSON from AI:", e);
      return null;
    }
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { imageData, goal, language } = await req.json();

    if (!imageData) {
      throw new Error("Image data is required");
    }

    const userLang = language && language.startsWith('es') ? 'Spanish' : 'English';
    
    let goalContext = "maintain a healthy weight";
    if (goal === 'lose_weight') goalContext = `lose weight`;
    else if (goal === 'gain_weight') goalContext = `gain muscle/weight`;

    const prompt = `
      Analyze the provided image of a restaurant menu.
      User Goal: ${goalContext}.
      
      Task:
      1. Identify food items visible on the menu.
      2. Select the 3-4 HEALTHIEST options aligned with the user's goal.
      3. Identify 1-2 options to AVOID.
      4. For each choice, provide a brief explanation. DO NOT calculate nutritional values.
      
      Output Language: ${userLang}.
      Format: Return ONLY a valid JSON object. No markdown, no extra text.
      
      JSON Structure:
      {
        "recommended": [
          { "name": "Dish Name", "reason": "Brief reason why it's good" }
        ],
        "avoid": [
          { "name": "Dish Name", "reason": "Brief reason why to avoid" }
        ],
        "summary": "One sentence summary advice for this menu."
      }
    `;

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

    const parsedData = safeParseJson(content);

    if (!parsedData) {
      throw new Error("Failed to parse AI response as JSON");
    }

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