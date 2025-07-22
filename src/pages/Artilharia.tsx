import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Target, Calendar } from "lucide-react";
import { getSupabasePlayers, getSupabaseGoals, getSupabaseGames } from "@/services/supabaseDataService";
import { Player, Goal, Game, GameType } from "@/types";
import MainLayout from "@/components/layout/MainLayout";
import AddGoalsDialog from "@/components/AddGoalsDialog";
import { generateQuarterPeriods, QuarterPeriod } from "@/utils/quarterPeriods";

const Artilharia = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [quarterPeriods, setQuarterPeriods] = useState<QuarterPeriod[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [playersData, goalsData, gamesData] = await Promise.all([
        getSupabasePlayers(),
        getSupabaseGoals(),
        getSupabaseGames()
      ]);
      
      setPlayers(playersData);
      setGoals(goalsData);
      setGames(gamesData);

      // Gerar períodos de trimestre
      const periods = generateQuarterPeriods(gamesData);
      setQuarterPeriods(periods);
      if (periods.length > 0 && !selectedPeriod) {
        setSelectedPeriod(periods[0].id); // Selecionar o primeiro período (mais recente)
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoalsAdded = () => {
    loadData(); // Reload data after goals are added
  };

  const getTopScorers = (
    period?: { start: string; end: string },
    gameType?: GameType
  ): Array<{ player: Player; goals: number }> => {
    // Use selectedPeriod if no specific period is provided
    const selectedPeriodData = period ? null : quarterPeriods.find(p => p.id === selectedPeriod);
    const activePeriod = period || selectedPeriodData;

    const filteredGoals = goals.filter(goal => {
      const game = games.find(g => g.id === goal.gameId);
      if (!game) return false;
      
      const gameDate = new Date(game.date);
      const matchesGameType = !gameType || game.type === gameType;
      const matchesPeriod = !activePeriod || 
        (gameDate >= new Date(activePeriod.start) && gameDate <= new Date(activePeriod.end));
      
      return matchesGameType && matchesPeriod;
    });

    const playerGoals = filteredGoals.reduce((acc, goal) => {
      const playerId = goal.playerId;
      if (!acc[playerId]) {
        acc[playerId] = 0;
      }
      acc[playerId] += goal.count;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(playerGoals)
      .map(([playerId, goals]) => {
        const player = players.find(p => p.id === playerId);
        return player ? { player, goals } : null;
      })
      .filter(Boolean as any)
      .sort((a, b) => b.goals - a.goals) as Array<{ player: Player; goals: number }>;
  };

  const getPlayerInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const topScorers = getTopScorers();
  const peladaScorers = getTopScorers(undefined, 'pelada');
  const campeonatoScorers = getTopScorers(undefined, 'campeonato');

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto">
          <div className="text-center py-8">Carregando dados...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">Artilharia</h1>
            {quarterPeriods.length > 0 && (
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  {quarterPeriods.map((period) => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <AddGoalsDialog onGoalsAdded={handleGoalsAdded} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <CardTitle className="text-lg">Artilharia Geral</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topScorers.slice(0, 5).map((scorer, index) => (
                  <div key={scorer.player.id} className="flex items-center space-x-3">
                    <Badge variant={index === 0 ? "default" : "secondary"} className="w-6 h-6 rounded-full flex items-center justify-center p-0">
                      {index + 1}
                    </Badge>
                    <Avatar className="h-8 w-8">
                      {scorer.player.photo ? (
                        <AvatarImage src={scorer.player.photo} alt={scorer.player.name} />
                      ) : (
                        <AvatarFallback className="text-xs">
                          {getPlayerInitials(scorer.player.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{scorer.player.name}</p>
                    </div>
                    <Badge variant="outline">{scorer.goals} gols</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-lg">Peladas</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {peladaScorers.slice(0, 5).map((scorer, index) => (
                  <div key={scorer.player.id} className="flex items-center space-x-3">
                    <Badge variant={index === 0 ? "default" : "secondary"} className="w-6 h-6 rounded-full flex items-center justify-center p-0">
                      {index + 1}
                    </Badge>
                    <Avatar className="h-8 w-8">
                      {scorer.player.photo ? (
                        <AvatarImage src={scorer.player.photo} alt={scorer.player.name} />
                      ) : (
                        <AvatarFallback className="text-xs">
                          {getPlayerInitials(scorer.player.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{scorer.player.name}</p>
                    </div>
                    <Badge variant="outline">{scorer.goals} gols</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-green-500" />
                <CardTitle className="text-lg">Campeonatos</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {campeonatoScorers.slice(0, 5).map((scorer, index) => (
                  <div key={scorer.player.id} className="flex items-center space-x-3">
                    <Badge variant={index === 0 ? "default" : "secondary"} className="w-6 h-6 rounded-full flex items-center justify-center p-0">
                      {index + 1}
                    </Badge>
                    <Avatar className="h-8 w-8">
                      {scorer.player.photo ? (
                        <AvatarImage src={scorer.player.photo} alt={scorer.player.name} />
                      ) : (
                        <AvatarFallback className="text-xs">
                          {getPlayerInitials(scorer.player.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{scorer.player.name}</p>
                    </div>
                    <Badge variant="outline">{scorer.goals} gols</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ranking Completo</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Pos.</TableHead>
                  <TableHead>Jogador</TableHead>
                  <TableHead>Posição</TableHead>
                  <TableHead>Nota</TableHead>
                  <TableHead className="text-right">Gols</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topScorers.map((scorer, index) => (
                  <TableRow key={scorer.player.id}>
                    <TableCell>
                      <Badge variant={index < 3 ? "default" : "secondary"}>
                        {index + 1}°
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          {scorer.player.photo ? (
                            <AvatarImage src={scorer.player.photo} alt={scorer.player.name} />
                          ) : (
                            <AvatarFallback>
                              {getPlayerInitials(scorer.player.name)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <span className="font-medium">{scorer.player.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{scorer.player.position}</TableCell>
                    <TableCell>{scorer.player.rating.toFixed(1)}</TableCell>
                    <TableCell className="text-right font-bold">{scorer.goals}</TableCell>
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

export default Artilharia;
