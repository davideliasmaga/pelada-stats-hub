
import React, { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { CalendarIcon, Plus } from "lucide-react";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import { getGames, getPlayers, createGame, deleteGame, generateBalancedTeams } from "@/services/dataService";
import { Game, GameType, Player } from "@/types";
import { useUser } from "@/contexts/UserContext";
import { Navigate } from "react-router-dom";

const Jogos = () => {
  const { isAdmin } = useUser();
  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("game");
  
  // Form state for new game
  const [gameDate, setGameDate] = useState<Date | undefined>(new Date());
  const [gameType, setGameType] = useState<GameType>("pelada");
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [generatedTeams, setGeneratedTeams] = useState<Player[][]>([]);
  
  useEffect(() => {
    setGames(getGames());
    setPlayers(getPlayers());
  }, []);
  
  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  const handleGenerateTeams = () => {
    if (selectedPlayers.length < 8) {
      toast.error("Selecione pelo menos 8 jogadores para gerar os times");
      return;
    }
    
    // Generate 4 teams from selected players
    const teams = generateBalancedTeams(selectedPlayers, 4);
    setGeneratedTeams(teams);
    setActiveTab("teams");
  };

  const handleAddGame = () => {
    if (!gameDate) return;

    // Ensure teams were generated
    if (selectedPlayers.length >= 8 && generatedTeams.length === 0) {
      toast.error("Você precisa gerar os times antes de salvar o jogo");
      return;
    }

    const newGame = createGame({
      date: gameDate.toISOString(),
      type: gameType
    });

    setGames([...games, newGame]);
    toast.success("Jogo criado com sucesso!");
    
    // Reset form
    setGameDate(new Date());
    setGameType("pelada");
    setSelectedPlayers([]);
    setGeneratedTeams([]);
    setActiveTab("game");
    setDialogOpen(false);
  };

  const handleDeleteGame = (id: string) => {
    if (deleteGame(id)) {
      setGames(games.filter(game => game.id !== id));
      toast.success("Jogo removido com sucesso!");
    }
  };

  const handlePlayerSelection = (playerId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedPlayers([...selectedPlayers, playerId]);
    } else {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
    }
    // Reset teams when player selection changes
    setGeneratedTeams([]);
  };

  const getTeamColor = (index: number) => {
    const colors = ["bg-red-100 text-red-700", "bg-blue-100 text-blue-700", "bg-green-100 text-green-700", "bg-yellow-100 text-yellow-700"];
    return colors[index % colors.length];
  };

  return (
    <MainLayout>
      <div className="container mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold">Gerenciar Jogos</h1>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gray-900 hover:bg-gray-800">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Jogo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Jogo</DialogTitle>
              </DialogHeader>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="game">Informações do Jogo</TabsTrigger>
                  <TabsTrigger value="teams" disabled={selectedPlayers.length < 8}>
                    Times
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="game" className="space-y-4 mt-4">
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Data do Jogo</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left",
                              !gameDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {gameDate ? (
                              format(gameDate, "PPP", { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={gameDate}
                            onSelect={setGameDate}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo de Jogo</Label>
                      <Select 
                        value={gameType} 
                        onValueChange={(value) => setGameType(value as GameType)}
                      >
                        <SelectTrigger id="type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="pelada">Pelada</SelectItem>
                            <SelectItem value="campeonato">Campeonato</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Jogadores Presentes</Label>
                      <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
                        {players.map((player) => (
                          <div key={player.id} className="flex items-center space-x-2 py-1">
                            <Checkbox 
                              id={`player-${player.id}`}
                              checked={selectedPlayers.includes(player.id)}
                              onCheckedChange={(checked) => 
                                handlePlayerSelection(player.id, checked === true)
                              }
                            />
                            <label 
                              htmlFor={`player-${player.id}`}
                              className="text-sm cursor-pointer flex-1"
                            >
                              {player.name} 
                              <span className="ml-2 text-xs">
                                ({player.position}, 
                                {player.running === "sim" ? " corre" : 
                                 player.running === "nao" ? " não corre" : 
                                 " corre médio"}
                                , {player.rating}/10)
                              </span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {selectedPlayers.length >= 8 && (
                      <Button 
                        onClick={handleGenerateTeams} 
                        className="bg-gray-700 hover:bg-gray-600"
                      >
                        Gerar 4 Times Equilibrados
                      </Button>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="teams" className="space-y-4 mt-4">
                  {generatedTeams.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {generatedTeams.map((team, teamIndex) => (
                        <Card key={`team-${teamIndex}`}>
                          <CardHeader className={cn("py-3", getTeamColor(teamIndex))}>
                            <CardTitle className="text-center">Time {teamIndex + 1}</CardTitle>
                          </CardHeader>
                          <CardContent className="py-2">
                            <ul className="space-y-1">
                              {team.map((player) => (
                                <li key={player.id} className="flex justify-between items-center text-sm py-1 border-b last:border-0">
                                  <span>{player.name}</span>
                                  <div className="flex gap-2 text-xs text-gray-500">
                                    <span>{player.position}</span>
                                    <span>•</span>
                                    <span>{player.rating}/10</span>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p>Clique em "Gerar Times Equilibrados" na aba anterior para visualizar os times.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              
              <DialogFooter>
                <Button
                  onClick={handleAddGame}
                  className="bg-gray-900 hover:bg-gray-800"
                  disabled={!gameDate || (selectedPlayers.length >= 8 && generatedTeams.length === 0)}
                >
                  Salvar Jogo
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Jogos Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {games.map((game) => (
                  <TableRow key={game.id}>
                    <TableCell>{format(parseISO(game.date), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        game.type === 'pelada' 
                          ? 'bg-gray-200 text-gray-900' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {game.type === 'pelada' ? 'Pelada' : 'Campeonato'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                        onClick={() => handleDeleteGame(game.id)}
                      >
                        Remover
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Jogos;
