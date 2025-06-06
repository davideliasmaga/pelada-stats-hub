
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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { getSupabasePlayers, createSupabaseGame } from "@/services/supabaseDataService";
import { Player, GameType } from "@/types";
import { toast } from "sonner";

interface AddGameDialogProps {
  onGameAdded: () => void;
}

const AddGameDialog = ({ onGameAdded }: AddGameDialogProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameDate, setGameDate] = useState('');
  const [gameType, setGameType] = useState<GameType>('pelada');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (dialogOpen) {
      loadPlayers();
      // Set today's date as default
      const today = new Date().toISOString().split('T')[0];
      setGameDate(today);
    }
  }, [dialogOpen]);

  const loadPlayers = async () => {
    try {
      const playersData = await getSupabasePlayers();
      setPlayers(playersData);
    } catch (error) {
      console.error('Error loading players:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar jogadores';
      toast.error(errorMessage);
    }
  };

  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayers(prev => 
      prev.includes(playerId) 
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleSaveGame = async () => {
    if (!gameDate) {
      toast.error('Selecione uma data para o jogo');
      return;
    }

    try {
      setLoading(true);
      console.log('Saving game...', {
        date: gameDate,
        type: gameType,
        selectedPlayers
      });
      
      await createSupabaseGame({
        date: gameDate,
        type: gameType
      }, selectedPlayers);
      
      toast.success('Jogo salvo com sucesso!');
      onGameAdded();
      
      // Reset form
      setGameDate('');
      setGameType('pelada');
      setSelectedPlayers([]);
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving game:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao salvar jogo';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gray-900 hover:bg-gray-800">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Jogo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Jogo</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="date">Data do Jogo</Label>
            <Input
              id="date"
              type="date"
              value={gameDate}
              onChange={(e) => setGameDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Jogo</Label>
            <Select value={gameType} onValueChange={(value) => setGameType(value as GameType)}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pelada">Pelada</SelectItem>
                <SelectItem value="campeonato">Campeonato</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Jogadores Presentes</Label>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {players.map((player) => (
                <div key={player.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`player-${player.id}`}
                    checked={selectedPlayers.includes(player.id)}
                    onCheckedChange={() => handlePlayerToggle(player.id)}
                  />
                  <Label 
                    htmlFor={`player-${player.id}`} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {player.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            onClick={handleSaveGame}
            className="bg-gray-900 hover:bg-gray-800"
            disabled={!gameDate || loading}
          >
            {loading ? 'Salvando...' : 'Salvar Jogo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddGameDialog;
