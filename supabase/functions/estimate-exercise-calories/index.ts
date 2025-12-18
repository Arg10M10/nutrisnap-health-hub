import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { entry_id, description, weight, language } = await req.json();
    if (!entry_id || !description) {
      return new Response(JSON.stringify({ error: "entry_id and description are required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const userLang = language && language.startsWith('es') ? 'Español' : 'Inglés';

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const prompt = `
      Eres una IA experta en fitness. Analiza la descripción de un ejercicio.
      - Descripción: "${description}"
      - Peso: ${weight ?? '70'} kg
      
      Reglas:
      1. Extrae el nombre del ejercicio (en ${userLang}).
      2. Extrae la duración en minutos.
      3. Estima las calorías quemadas.
      4. Responde SOLO JSON válido:
      {
        "name": "Nombre en ${userLang}",
        "duration": number,
        "calories": number
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
      const text = await aiRes.text();
      console.error("GPT error:", text);
      throw new Error(aiRes.statusText);
    }

    const aiData = await aiRes.json();
    const jsonText = aiData.choices?.[0]?.message?.content ?? "{}";
    const estimation = JSON.parse(jsonText);

    const { error: updateError } = await supabaseAdmin
      .from('exercise_entries')
      .update({
        exercise_type: 'other', 
        description: estimation.name,
        duration_minutes: estimation.duration,
        calories_burned: estimation.calories,
        status: 'completed',
      })
      .eq('id', entry_id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (e) {
    console.error("estimate-exercise-calories error:", e);
    const { entry_id } = await req.json();
    if (entry_id) {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      await supabaseAdmin
        .from('exercise_entries')
        .update({ status: 'failed', reason: (e as Error).message })
        .eq('id', entry_id);
    }
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});