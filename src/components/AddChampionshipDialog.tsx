import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Player, Championship, Game } from '@/types';
import { getSupabaseGames, getGamePlayers } from '@/services/supabaseDataService';

interface AddChampionshipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (championship: Omit<Championship, 'id'>) => void;
  players: Player[];
}

const AddChampionshipDialog = ({ open, onOpenChange, onAdd, players }: AddChampionshipDialogProps) => {
  const [selectedGameId, setSelectedGameId] = useState<string>('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [games, setGames] = useState<Game[]>([]);
  const [gamePlayers, setGamePlayers] = useState<Player[]>([]);
  const [gameSearchOpen, setGameSearchOpen] = useState(false);
  const [playerSearchOpen, setPlayerSearchOpen] = useState(false);

  useEffect(() => {
    loadGames();
  }, []);

  useEffect(() => {
    if (selectedGameId) {
      loadGamePlayers();
    } else {
      setGamePlayers([]);
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
    
    if (!selectedGameId || !selectedPlayerId) {
      return;
    }

    const selectedGame = games.find(g => g.id === selectedGameId);
    if (!selectedGame) return;

    onAdd({
      gameId: selectedGameId,
      playerId: selectedPlayerId,
      year: new Date(selectedGame.date).getFullYear(),
      date: selectedGame.date,
    });

    // Reset form
    setSelectedGameId('');
    setSelectedPlayerId('');
    setGamePlayers([]);
  };

  const selectedGame = games.find(g => g.id === selectedGameId);
  const selectedPlayer = gamePlayers.find(p => p.id === selectedPlayerId);

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
                            setSelectedPlayerId(''); // Reset player selection
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
              <Label htmlFor="player">Jogador Campeão</Label>
              <Popover open={playerSearchOpen} onOpenChange={setPlayerSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={playerSearchOpen}
                    className="w-full justify-between"
                  >
                    {selectedPlayer ? selectedPlayer.name : "Selecionar campeão..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar jogador..." />
                    <CommandList>
                      <CommandEmpty>Nenhum jogador encontrado neste jogo.</CommandEmpty>
                      <CommandGroup>
                        {gamePlayers.map((player) => (
                          <CommandItem
                            key={player.id}
                            value={player.name}
                            onSelect={() => {
                              setSelectedPlayerId(player.id);
                              setPlayerSearchOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedPlayerId === player.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {player.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!selectedGameId || !selectedPlayerId}>
              Adicionar Campeonato
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddChampionshipDialog;