import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { deviceId } = await req.json();

    if (!deviceId) {
      return new Response(JSON.stringify({ error: "Device ID required" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Contar cuántas cuentas están asociadas a este dispositivo
    const { count, error } = await supabaseAdmin
      .from('device_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('device_id', deviceId);

    if (error) throw error;

    const currentCount = count || 0;
    const LIMIT = 2;

    if (currentCount >= LIMIT) {
      return new Response(JSON.stringify({ 
        allowed: false, 
        message: "Has alcanzado el límite de 2 cuentas creadas en este dispositivo." 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Retornamos 200 pero con allowed: false para manejarlo en el front
      });
    }

    return new Response(JSON.stringify({ allowed: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error checking device limit:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});