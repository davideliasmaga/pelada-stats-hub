
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { getSupabaseGames, getGamePlayers, createSupabaseGoal } from "@/services/supabaseDataService";
import { Game, Player } from "@/types";
import { toast } from "sonner";

interface AddGoalsDialogProps {
  onGoalsAdded: () => void;
}

const AddGoalsDialog = ({ onGoalsAdded }: AddGoalsDialogProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string>("");
  const [playersPresent, setPlayersPresent] = useState<Player[]>([]);
  const [playerGoals, setPlayerGoals] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [playerSearchTerm, setPlayerSearchTerm] = useState('');

  useEffect(() => {
    if (dialogOpen) {
      loadGames();
    }
  }, [dialogOpen]);

  useEffect(() => {
    if (selectedGameId) {
      loadGamePlayers();
    }
  }, [selectedGameId]);

  const loadGames = async () => {
    try {
      const gamesData = await getSupabaseGames();
      setGames(gamesData);
    } catch (error) {
      console.error('Error loading games:', error);
      toast.error('Erro ao carregar jogos');
    }
  };

  const loadGamePlayers = async () => {
    try {
      const players = await getGamePlayers(selectedGameId);
      setPlayersPresent(players);
      // Reset player goals when changing game
      setPlayerGoals({});
    } catch (error) {
      console.error('Error loading game players:', error);
      toast.error('Erro ao carregar jogadores do jogo');
    }
  };

  const handlePlayerGoalsChange = (playerId: string, goals: number) => {
    setPlayerGoals(prev => ({
      ...prev,
      [playerId]: goals
    }));
  };

  const handleSaveGoals = async () => {
    if (!selectedGameId) {
      toast.error('Selecione um jogo');
      return;
    }

    try {
      setLoading(true);
      
      // Save goals for each player that has goals > 0
      const goalPromises = Object.entries(playerGoals)
        .filter(([_, goals]) => goals > 0)
        .map(([playerId, goals]) => 
          createSupabaseGoal({
            gameId: selectedGameId,
            playerId,
            count: goals
          })
        );

      await Promise.all(goalPromises);
      
      toast.success('Gols salvos com sucesso!');
      onGoalsAdded();
      
      // Reset form
      setSelectedGameId("");
      setPlayersPresent([]);
      setPlayerGoals({});
      setPlayerSearchTerm('');
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving goals:', error);
      toast.error('Erro ao salvar gols');
    } finally {
      setLoading(false);
    }
  };

  const formatGameDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getGameTypeText = (type: string) => {
    return type === 'pelada' ? 'Pelada' : 'Campeonato';
  };

  const filteredPlayersPresent = playersPresent.filter(player =>
    player.name.toLowerCase().includes(playerSearchTerm.toLowerCase())
  );

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gray-900 hover:bg-gray-800">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Gols
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Gols</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="game">Jogo</Label>
            <Select value={selectedGameId} onValueChange={setSelectedGameId}>
              <SelectTrigger id="game">
                <SelectValue placeholder="Selecione um jogo" />
              </SelectTrigger>
              <SelectContent>
                {games.map((game) => (
                  <SelectItem key={game.id} value={game.id}>
                    {formatGameDate(game.date)} - {getGameTypeText(game.type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {playersPresent.length > 0 && (
            <div className="space-y-3">
              <Label>Jogadores Presentes</Label>
              
              {/* Search bar for players */}
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar jogador..."
                  value={playerSearchTerm}
                  onChange={(e) => setPlayerSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredPlayersPresent.map((player) => (
                  <div key={player.id} className="flex items-center justify-between gap-2 p-2 border rounded">
                    <span className="font-medium">{player.name}</span>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`goals-${player.id}`} className="text-sm">Gols:</Label>
                      <Input
                        id={`goals-${player.id}`}
                        type="number"
                        min="0"
                        max="20"
                        value={playerGoals[player.id] || 0}
                        onChange={(e) => handlePlayerGoalsChange(player.id, parseInt(e.target.value) || 0)}
                        className="w-16 text-center"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            onClick={handleSaveGoals}
            className="bg-gray-900 hover:bg-gray-800"
            disabled={!selectedGameId || playersPresent.length === 0 || loading}
          >
            {loading ? 'Salvando...' : 'Salvar Gols'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddGoalsDialog;
