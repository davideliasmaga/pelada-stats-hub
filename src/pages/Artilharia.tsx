
import React, { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getTopScorers, getGames, getPlayers, createGoal } from "@/services/dataService";
import { Game, GameType, Player } from "@/types";
import { cn } from "@/lib/utils";
import { CalendarIcon, Plus } from "lucide-react";

const Artilharia = () => {
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});
  const [gameType, setGameType] = useState<GameType | "all">("all");
  const [topScorers, setTopScorers] = useState<Array<{ player: any; goals: number }>>([]);
  const [selectedGame, setSelectedGame] = useState<string>("");
  const [playerGoals, setPlayerGoals] = useState<{ [playerId: string]: number }>({});
  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setGames(getGames());
    setPlayers(getPlayers());
  }, []);

  useEffect(() => {
    let dateRangeObj;
    
    if (dateRange.start && dateRange.end) {
      dateRangeObj = {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString()
      };
    }
    
    const filteredGameType = gameType === "all" ? undefined : gameType as GameType;
    const scorers = getTopScorers(dateRangeObj, filteredGameType);
    setTopScorers(scorers);
  }, [dateRange, gameType]);

  const handleGameSelection = (gameId: string) => {
    setSelectedGame(gameId);
    // Reset player goals when selecting a new game
    setPlayerGoals({});
  };

  const handleGoalChange = (playerId: string, goals: number) => {
    setPlayerGoals(prev => ({ ...prev, [playerId]: goals }));
  };

  const handleSaveGoals = () => {
    if (!selectedGame) return;

    Object.entries(playerGoals).forEach(([playerId, goals]) => {
      if (goals > 0) {
        createGoal({ 
          gameId: selectedGame,
          playerId,
          count: goals 
        });
      }
    });

    // Update scorers after saving
    let dateRangeObj;
    if (dateRange.start && dateRange.end) {
      dateRangeObj = {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString()
      };
    }
    const filteredGameType = gameType === "all" ? undefined : gameType as GameType;
    const updatedScorers = getTopScorers(dateRangeObj, filteredGameType);
    setTopScorers(updatedScorers);

    // Reset and close dialog
    setPlayerGoals({});
    setSelectedGame("");
    setDialogOpen(false);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Artilharia</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="space-y-2">
            <Label>Período</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left w-full",
                      !dateRange.start && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.start ? 
                      format(dateRange.start, "dd/MM/yyyy") : 
                      "Data inicial"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.start}
                    onSelect={(date) => setDateRange(prev => ({ ...prev, start: date }))}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left w-full",
                      !dateRange.end && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.end ? 
                      format(dateRange.end, "dd/MM/yyyy") : 
                      "Data final"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.end}
                    onSelect={(date) => setDateRange(prev => ({ ...prev, end: date }))}
                    initialFocus
                    disabled={(date) => 
                      dateRange.start ? date < dateRange.start : false
                    }
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Tipo de Jogo</Label>
            <Select value={gameType} onValueChange={setGameType as any}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pelada">Pelada</SelectItem>
                  <SelectItem value="campeonato">Campeonato</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-gray-900 hover:bg-gray-800">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Gols
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Gols ao Jogo</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Selecione o Jogo</Label>
                    <Select 
                      value={selectedGame} 
                      onValueChange={handleGameSelection}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um jogo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {games.map(game => (
                            <SelectItem key={game.id} value={game.id}>
                              {format(parseISO(game.date), "dd/MM/yyyy", { locale: ptBR })} - 
                              {game.type === "pelada" ? " Pelada" : " Campeonato"}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedGame && (
                    <div className="space-y-2">
                      <Label>Gols por Jogador</Label>
                      <div className="max-h-[300px] overflow-y-auto">
                        {players.map(player => (
                          <div key={player.id} className="flex items-center justify-between py-2 border-b">
                            <span>{player.name}</span>
                            <Select 
                              value={playerGoals[player.id]?.toString() || "0"} 
                              onValueChange={(value) => handleGoalChange(player.id, Number(value))}
                            >
                              <SelectTrigger className="w-[80px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 21 }, (_, i) => (
                                  <SelectItem key={i} value={i.toString()}>
                                    {i}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button 
                    onClick={handleSaveGoals} 
                    disabled={!selectedGame}
                    className="bg-gray-900 hover:bg-gray-800"
                  >
                    Salvar Gols
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Ranking de Artilheiros</CardTitle>
          </CardHeader>
          <CardContent>
            {topScorers.length > 0 ? (
              <div className="space-y-6">
                {topScorers.slice(0, 10).map((scorer, index) => (
                  <div key={scorer.player.id} className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-900 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="ml-4 flex-grow">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{scorer.player.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {scorer.player.position}
                          </p>
                        </div>
                        <div className="text-xl font-bold">{scorer.goals}</div>
                      </div>
                      <div className="mt-2 w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-gray-900 h-2 rounded-full" 
                          style={{ 
                            width: `${(scorer.goals / topScorers[0].goals) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                Nenhum gol registrado para o período e tipo de jogo selecionados.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Artilharia;
