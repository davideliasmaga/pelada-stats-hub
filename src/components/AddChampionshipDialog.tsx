import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Player, Championship } from '@/types';

interface AddChampionshipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (championship: Omit<Championship, 'id'>) => void;
  players: Player[];
}

const AddChampionshipDialog = ({ open, onOpenChange, onAdd, players }: AddChampionshipDialogProps) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [playerSearchOpen, setPlayerSearchOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlayerId || !date) {
      return;
    }

    onAdd({
      playerId: selectedPlayerId,
      year: selectedYear,
      date: new Date(date).toISOString(),
    });

    // Reset form
    setSelectedPlayerId('');
    setSelectedYear(2025);
    setDate(new Date().toISOString().split('T')[0]);
  };

  const selectedPlayer = players.find(p => p.id === selectedPlayerId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Campeonato</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                  {selectedPlayer ? selectedPlayer.name : "Selecionar jogador..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar jogador..." />
                  <CommandList>
                    <CommandEmpty>Nenhum jogador encontrado.</CommandEmpty>
                    <CommandGroup>
                      {players.map((player) => (
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

          <div className="space-y-2">
            <Label htmlFor="year">Ano</Label>
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!selectedPlayerId || !date}>
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddChampionshipDialog;