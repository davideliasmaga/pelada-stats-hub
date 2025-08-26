import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Player, Championship, Game } from '@/types';
import { getSupabaseGames, getGamePlayers } from '@/services/supabaseDataService';

interface AddChampionshipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (championships: Omit<Championship, 'id'>[]) => void;
  players: Player[];
}

const AddChampionshipDialog = ({ open, onOpenChange, onAdd, players }: AddChampionshipDialogProps) => {
  const [selectedGameId, setSelectedGameId] = useState<string>('');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [gamePlayers, setGamePlayers] = useState<Player[]>([]);
  const [gameSearchOpen, setGameSearchOpen] = useState(false);
  const [playerSearchOpen, setPlayerSearchOpen] = useState(false);
  const [playerSearchTerm, setPlayerSearchTerm] = useState('');

  useEffect(() => {
    loadGames();
  }, []);

  useEffect(() => {
    if (selectedGameId) {
      loadGamePlayers();
    } else {
      setGamePlayers([]);
      setSelectedPlayerIds([]);
    }
  }, [selectedGameId]);

  const loadGames = async () => {
    try {
      const gamesData = await getSupabaseGames();
      // Filtrar apenas jogos de campeonato
      const championshipGames = gamesData.filter(game => game.type === 'campeonato');
      setGames(championshipGames);
    } catch (error) {
      console.error('Erro ao carregar jogos:', error);
    }
  };

  const loadGamePlayers = async () => {
    if (!selectedGameId) return;
    
    try {
      const playersData = await getGamePlayers(selectedGameId);
      setGamePlayers(playersData);
    } catch (error) {
      console.error('Erro ao carregar jogadores do jogo:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGameId || selectedPlayerIds.length === 0) {
      return;
    }

    const selectedGame = games.find(g => g.id === selectedGameId);
    if (!selectedGame) return;

    const championships = selectedPlayerIds.map(playerId => ({
      gameId: selectedGameId,
      playerId,
      year: new Date(selectedGame.date).getFullYear(),
      date: selectedGame.date,
    }));

    onAdd(championships);

    // Reset form
    setSelectedGameId('');
    setSelectedPlayerIds([]);
    setGamePlayers([]);
  };

  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayerIds(prev => 
      prev.includes(playerId) 
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const filteredPlayers = gamePlayers.filter(player =>
    player.name.toLowerCase().includes(playerSearchTerm.toLowerCase())
  );

  const selectedGame = games.find(g => g.id === selectedGameId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Campeonato</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="game">Jogo de Campeonato</Label>
            <Popover open={gameSearchOpen} onOpenChange={setGameSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={gameSearchOpen}
                  className="w-full justify-between"
                >
                  {selectedGame 
                    ? `${new Date(selectedGame.date).toLocaleDateString('pt-BR')} - ${selectedGame.type}`
                    : "Selecionar jogo..."
                  }
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar jogo..." />
                  <CommandList>
                    <CommandEmpty>Nenhum jogo de campeonato encontrado.</CommandEmpty>
                    <CommandGroup>
                      {games.map((game) => (
                        <CommandItem
                          key={game.id}
                          value={`${new Date(game.date).toLocaleDateString('pt-BR')} - ${game.type}`}
                          onSelect={() => {
                            setSelectedGameId(game.id);
                            setSelectedPlayerIds([]); // Reset player selection
                            setGameSearchOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedGameId === game.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {new Date(game.date).toLocaleDateString('pt-BR')} - {game.type}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {selectedGameId && (
            <div className="space-y-2">
              <Label>Campeões ({selectedPlayerIds.length} selecionados)</Label>
              <Input
                placeholder="Buscar jogador..."
                value={playerSearchTerm}
                onChange={(e) => setPlayerSearchTerm(e.target.value)}
                className="mb-2"
              />
              <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-2">
                {filteredPlayers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {playerSearchTerm ? 'Nenhum jogador encontrado com esse nome.' : 'Nenhum jogador encontrado neste jogo.'}
                  </p>
                ) : (
                  filteredPlayers.map((player) => (
                    <div key={player.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={player.id}
                        checked={selectedPlayerIds.includes(player.id)}
                        onCheckedChange={() => handlePlayerToggle(player.id)}
                      />
                      <Label htmlFor={player.id} className="flex-1 text-sm cursor-pointer">
                        {player.name}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!selectedGameId || selectedPlayerIds.length === 0}>
              Adicionar Campeonato
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddChampionshipDialog;