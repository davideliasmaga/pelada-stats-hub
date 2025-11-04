import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

interface Player {
  id: string;
  name: string;
}

interface MatchedPlayer {
  originalName: string;
  matchedName: string;
  playerId: string | null;
  confidence: 'high' | 'medium' | 'low';
  goals: number;
}

interface ProcessedData {
  players: MatchedPlayer[];
  date: string | null;
  gameType: 'pelada' | 'campeonato';
  totalPlayers: number;
  matchedCount: number;
}

export default function AlimentacaoInteligente() {
  const navigate = useNavigate();
  const { isAdmin } = useUser();
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [gameDate, setGameDate] = useState('');
  const [winnerTeam, setWinnerTeam] = useState<'time1' | 'time2'>('time1');
  const [isSaving, setIsSaving] = useState(false);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [playerSearchTerm, setPlayerSearchTerm] = useState<{[key: number]: string}>({});

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>Apenas administradores podem acessar esta página.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleProcess = async () => {
    if (!inputText.trim()) {
      toast.error('Por favor, insira uma lista de jogadores');
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-game-list', {
        body: { text: inputText }
      });

      if (error) throw error;

      // Buscar todos os jogadores para dropdown
      const { data: playersData } = await supabase
        .from('players')
        .select('id, name')
        .order('name');
      
      setAllPlayers(playersData || []);
      setProcessedData(data);

      // Set default date if AI found one
      if (data.date) {
        setGameDate(data.date);
      } else {
        setGameDate(new Date().toISOString().split('T')[0]);
      }

      toast.success('Lista processada com sucesso!');
    } catch (error: any) {
      console.error('Error processing list:', error);
      toast.error(error.message || 'Erro ao processar lista');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoalsChange = (index: number, goals: number) => {
    if (!processedData) return;
    const updated = { ...processedData };
    updated.players[index].goals = Math.max(0, goals);
    setProcessedData(updated);
  };

  const handlePlayerChange = (index: number, playerId: string) => {
    if (!processedData) return;
    const updated = { ...processedData };
    updated.players[index].playerId = playerId;
    // Atualizar o matchedName com o nome do jogador selecionado
    const selectedPlayer = allPlayers.find(p => p.id === playerId);
    if (selectedPlayer) {
      updated.players[index].matchedName = selectedPlayer.name;
    }
    setProcessedData(updated);
  };

  const handleSave = async () => {
    if (!processedData || !gameDate) {
      toast.error('Dados incompletos para salvar');
      return;
    }

    const validPlayers = processedData.players.filter(p => p.playerId);
    if (validPlayers.length === 0) {
      toast.error('Nenhum jogador válido para salvar');
      return;
    }

    setIsSaving(true);
    try {
      // Create game
      const { data: game, error: gameError } = await supabase
        .from('games')
        .insert({
          date: new Date(gameDate).toISOString(),
          type: processedData.gameType,
          players_present: validPlayers.map(p => p.playerId)
        })
        .select()
        .single();

      if (gameError) throw gameError;

      // Create game_players entries
      const gamePlayers = validPlayers.map(p => ({
        game_id: game.id,
        player_id: p.playerId
      }));

      const { error: gamePlayersError } = await supabase
        .from('game_players')
        .insert(gamePlayers);

      if (gamePlayersError) throw gamePlayersError;

      // Create goals entries for players who scored
      const playersWithGoals = validPlayers.filter(p => p.goals > 0);
      if (playersWithGoals.length > 0) {
        const goals = playersWithGoals.map(p => ({
          game_id: game.id,
          player_id: p.playerId,
          count: p.goals
        }));

        const { error: goalsError } = await supabase
          .from('goals')
          .insert(goals);

        if (goalsError) throw goalsError;
      }

      toast.success('Jogo criado com sucesso!');
      navigate('/jogos');
    } catch (error: any) {
      console.error('Error saving game:', error);
      toast.error(error.message || 'Erro ao salvar jogo');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Alimentação Inteligente</CardTitle>
          <CardDescription>
            Cole uma lista com os jogadores e informações do jogo. A IA irá processar e identificar automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="input-text">Lista de Jogadores</Label>
            <Textarea
              id="input-text"
              placeholder="Ex: Jogo de pelada dia 15/01/2025
Jogadores: João, Maria, Pedro, Ana, Carlos, Beatriz, Lucas, Julia"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[150px] mt-2"
              disabled={isProcessing || processedData !== null}
            />
          </div>

          {!processedData && (
            <Button 
              onClick={handleProcess} 
              disabled={isProcessing || !inputText.trim()}
              className="w-full"
            >
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Processar Lista
            </Button>
          )}
        </CardContent>
      </Card>

      {processedData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Informações Processadas</CardTitle>
              <CardDescription>
                {processedData.matchedCount} de {processedData.totalPlayers} jogadores identificados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="game-date">Data do Jogo</Label>
                  <Input
                    id="game-date"
                    type="date"
                    value={gameDate}
                    onChange={(e) => setGameDate(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Tipo de Jogo</Label>
                  <div className="mt-2 p-3 bg-muted rounded-md">
                    {processedData.gameType === 'pelada' ? 'Pelada' : 'Campeonato'}
                  </div>
                </div>
              </div>

              {processedData.gameType === 'campeonato' && (
                <div>
                  <Label>Time Vencedor</Label>
                  <RadioGroup value={winnerTeam} onValueChange={(v) => setWinnerTeam(v as 'time1' | 'time2')} className="mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="time1" id="time1" />
                      <Label htmlFor="time1">Time 1</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="time2" id="time2" />
                      <Label htmlFor="time2">Time 2</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Jogadores Identificados</CardTitle>
              <CardDescription>Configure os gols de cada jogador</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {processedData.players.map((player, index) => (
                  <div 
                    key={index} 
                    className="p-4 rounded-lg border bg-background space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      {player.confidence === 'high' && player.playerId ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-amber-600 mt-1" />
                      )}
                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="font-medium">{player.originalName}</div>
                          <div className="text-xs text-muted-foreground">
                            Confiança: {player.confidence}
                          </div>
                        </div>

                        {player.confidence !== 'high' ? (
                          <div>
                            <Label htmlFor={`player-select-${index}`} className="text-sm mb-2">
                              Selecionar jogador da base:
                            </Label>
                            <Select
                              value={player.playerId || undefined}
                              onValueChange={(value) => handlePlayerChange(index, value)}
                            >
                              <SelectTrigger id={`player-select-${index}`} className="bg-background">
                                <SelectValue placeholder="Selecione um jogador" />
                              </SelectTrigger>
                              <SelectContent className="bg-background max-h-[300px]">
                                <div className="p-2">
                                  <Input
                                    placeholder="Buscar jogador..."
                                    value={playerSearchTerm[index] || ''}
                                    onChange={(e) => setPlayerSearchTerm({...playerSearchTerm, [index]: e.target.value})}
                                    className="mb-2"
                                  />
                                </div>
                                {allPlayers
                                  .filter(p => 
                                    !playerSearchTerm[index] || 
                                    p.name.toLowerCase().includes(playerSearchTerm[index].toLowerCase())
                                  )
                                  .map(p => (
                                    <SelectItem key={p.id} value={p.id}>
                                      {p.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Identificado como:</span>{' '}
                            <span className="font-medium">{player.matchedName}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Label htmlFor={`goals-${index}`} className="text-sm">
                            Gols:
                          </Label>
                          <Input
                            id={`goals-${index}`}
                            type="number"
                            min="0"
                            value={player.goals}
                            onChange={(e) => handleGoalsChange(index, parseInt(e.target.value) || 0)}
                            className="w-20"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || processedData.matchedCount === 0}
                  className="flex-1"
                >
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar Jogo
                </Button>
                <Button
                  onClick={() => {
                    setProcessedData(null);
                    setInputText('');
                  }}
                  variant="outline"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}