import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Mapping = { from: string; to: string };

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SERVICE_ROLE) {
      throw new Error("Supabase environment not configured");
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    const body = await req.json().catch(() => ({}));
    const mappings: Mapping[] = Array.isArray(body?.mappings) && body.mappings.length
      ? body.mappings
      : [
          { from: "2023-10-14", to: "2025-10-14" },
          { from: "2023-10-28", to: "2025-10-28" },
          { from: "2023-10-13", to: "2025-10-13" },
          { from: "2023-10-20", to: "2025-10-20" },
        ];

    const results: Array<{ from: string; to: string; updated: number }> = [];

    for (const m of mappings) {
      const { error } = await supabase.rpc('noop');
      // Update games on exact date (UTC midnight)
      const { data, error: updateError } = await supabase
        .from('games')
        .update({ date: new Date(`${m.to}T00:00:00.000Z`).toISOString() })
        .eq('date', new Date(`${m.from}T00:00:00.000Z`).toISOString())
        .select('id');

      if (updateError) {
        console.error('Update error for mapping', m, updateError);
        results.push({ from: m.from, to: m.to, updated: 0 });
        continue;
      }
      results.push({ from: m.from, to: m.to, updated: data?.length || 0 });
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fix-game-dates error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});