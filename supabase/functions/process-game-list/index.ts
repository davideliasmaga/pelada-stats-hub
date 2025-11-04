import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing game list text");

    // Get all players from database
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('id, name');

    if (playersError) {
      console.error("Error fetching players:", playersError);
      throw playersError;
    }

    console.log(`Found ${players.length} players in database`);

    const systemPrompt = `Você é um assistente especializado em processar listas de jogadores de futebol.
Você receberá um texto com informações sobre um jogo e deve extrair:
1. Lista de jogadores mencionados
2. Data do jogo (se mencionada)
3. Tipo de jogo (pelada ou campeonato)
4. Quantidade de gols de cada jogador (contar emojis ⚽ ou 🥅 antes do nome)

Os jogadores disponíveis no sistema são: ${players.map(p => p.name).join(', ')}

Para cada jogador mencionado no texto, tente fazer match com os jogadores da base.
Retorne apenas jogadores que você conseguir identificar com certeza.
Os emojis ⚽ ou 🥅 indicam quantidade de gols - conte-os para cada jogador.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_game_info",
              description: "Extrai informações do jogo a partir do texto",
              parameters: {
                type: "object",
                properties: {
                  players: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Nome do jogador como aparece no texto" },
                        matchedName: { type: "string", description: "Nome do jogador que melhor corresponde na base de dados" },
                        confidence: { type: "string", enum: ["high", "medium", "low"], description: "Confiança no match" },
                        goals: { type: "number", description: "Quantidade de gols (contar emojis ⚽ ou 🥅)", default: 0 }
                      },
                      required: ["name", "matchedName", "confidence", "goals"]
                    }
                  },
                  date: { 
                    type: "string", 
                    description: "Data do jogo no formato YYYY-MM-DD, ou null se não mencionada" 
                  },
                  gameType: { 
                    type: "string", 
                    enum: ["pelada", "campeonato"],
                    description: "Tipo do jogo identificado no texto"
                  }
                },
                required: ["players", "gameType"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_game_info" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const aiResponse = await response.json();
    console.log("AI Response:", JSON.stringify(aiResponse, null, 2));

    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const extractedInfo = JSON.parse(toolCall.function.arguments);
    console.log("Extracted info:", extractedInfo);

    // Map matched players to database IDs
    const matchedPlayers = extractedInfo.players.map((p: any) => {
      const dbPlayer = players.find(dbp => 
        dbp.name.toLowerCase() === p.matchedName.toLowerCase()
      );
      return {
        originalName: p.name,
        matchedName: p.matchedName,
        playerId: dbPlayer?.id || null,
        confidence: p.confidence,
        goals: p.goals || 0
      };
    });

    return new Response(
      JSON.stringify({
        players: matchedPlayers,
        date: extractedInfo.date || null,
        gameType: extractedInfo.gameType,
        totalPlayers: matchedPlayers.length,
        matchedCount: matchedPlayers.filter((p: any) => p.playerId).length
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error processing game list:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});