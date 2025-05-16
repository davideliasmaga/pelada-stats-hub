
import React, { useState } from "react";
import { format, parseISO, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MainLayout from "@/components/layout/MainLayout";
import { getTopScorers, getGames } from "@/services/dataService";
import { GameType } from "@/types";

type PeriodType = "month" | "quarter" | "year" | "game";

interface FilterState {
  period: PeriodType;
  gameType: GameType | "all";
  gameId: string;
  date: Date;
}

const Artilharia = () => {
  const [filters, setFilters] = useState<FilterState>({
    period: "month",
    gameType: "all",
    gameId: "",
    date: new Date(),
  });

  const games = getGames();

  const getDateRange = () => {
    const currentDate = filters.date;
    switch (filters.period) {
      case "month":
        return {
          start: startOfMonth(currentDate).toISOString(),
          end: endOfMonth(currentDate).toISOString(),
        };
      case "quarter": {
        const startDate = subMonths(currentDate, 3);
        return {
          start: startDate.toISOString(),
          end: currentDate.toISOString(),
        };
      }
      case "year":
        return {
          start: startOfYear(currentDate).toISOString(),
          end: endOfYear(currentDate).toISOString(),
        };
      case "game":
        if (filters.gameId) {
          const game = games.find((g) => g.id === filters.gameId);
          if (game) {
            return {
              start: game.date,
              end: game.date,
            };
          }
        }
        return {
          start: startOfMonth(currentDate).toISOString(),
          end: endOfMonth(currentDate).toISOString(),
        };
      default:
        return {
          start: startOfMonth(currentDate).toISOString(),
          end: endOfMonth(currentDate).toISOString(),
        };
    }
  };

  const dateRange = getDateRange();
  const gameType = filters.gameType === "all" ? undefined : filters.gameType as GameType;
  const topScorers = getTopScorers(
    filters.period === "game" && filters.gameId ? undefined : dateRange,
    gameType
  ).filter((scorer) => {
    if (filters.period === "game" && filters.gameId) {
      const goals = scorer.player.goals?.filter((g) => g.gameId === filters.gameId);
      return goals && goals.length > 0;
    }
    return true;
  });

  const handlePeriodChange = (value: string) => {
    setFilters((prev) => ({ ...prev, period: value as PeriodType }));
  };

  const handleGameTypeChange = (value: string) => {
    setFilters((prev) => ({ ...prev, gameType: value as GameType | "all" }));
  };

  const handleGameChange = (value: string) => {
    setFilters((prev) => ({ ...prev, gameId: value }));
  };

  const formatPeriod = () => {
    switch (filters.period) {
      case "month":
        return format(filters.date, "MMMM 'de' yyyy", { locale: ptBR });
      case "quarter":
        return `Últimos 3 meses`;
      case "year":
        return format(filters.date, "yyyy");
      case "game":
        if (filters.gameId) {
          const game = games.find((g) => g.id === filters.gameId);
          return game
            ? `${format(parseISO(game.date), "dd/MM/yyyy")} - ${
                game.type === "pelada" ? "Pelada" : "Campeonato"
              }`
            : "Selecione um jogo";
        }
        return "Selecione um jogo";
      default:
        return "";
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold">Artilharia</h1>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Select value={filters.period} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Mês</SelectItem>
                <SelectItem value="quarter">Trimestre</SelectItem>
                <SelectItem value="year">Ano</SelectItem>
                <SelectItem value="game">Jogo Específico</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.gameType} onValueChange={handleGameTypeChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tipo de Jogo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pelada">Pelada</SelectItem>
                <SelectItem value="campeonato">Campeonato</SelectItem>
              </SelectContent>
            </Select>
            
            {filters.period === "game" && (
              <Select value={filters.gameId} onValueChange={handleGameChange}>
                <SelectTrigger className="w-full sm:w-[240px]">
                  <SelectValue placeholder="Selecione um jogo" />
                </SelectTrigger>
                <SelectContent>
                  {games.map((game) => (
                    <SelectItem key={game.id} value={game.id}>
                      {format(parseISO(game.date), "dd/MM/yyyy")} - {game.type === "pelada" ? "Pelada" : "Campeonato"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Artilheiros - {formatPeriod()}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topScorers.length > 0 ? (
              <div className="space-y-6">
                {/* Top Scorer Highlight */}
                <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                  <div className="relative">
                    <Avatar className="h-24 w-24 mb-2 border-4 border-yellow-400">
                      <AvatarImage src={topScorers[0].player.photo} />
                      <AvatarFallback className="text-2xl">
                        {topScorers[0].player.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full h-10 w-10 flex items-center justify-center font-bold text-white text-lg">
                      1º
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mt-2">{topScorers[0].player.name}</h3>
                  <p className="text-2xl font-bold text-grass">{topScorers[0].goals} gols</p>
                </div>
                
                {/* All Scorers List */}
                <div className="divide-y">
                  {topScorers.map((scorer, index) => (
                    <div key={scorer.player.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-white ${
                          index === 0 
                            ? 'bg-yellow-400' 
                            : index === 1 
                              ? 'bg-gray-400' 
                              : index === 2 
                                ? 'bg-amber-700' 
                                : 'bg-gray-200 text-gray-700'
                        }`}>
                          {index + 1}
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={scorer.player.photo} />
                          <AvatarFallback>{scorer.player.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{scorer.player.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {scorer.player.position === 'atacante' 
                              ? 'Atacante' 
                              : scorer.player.position === 'defensor' 
                                ? 'Defensor' 
                                : scorer.player.position === 'meia' 
                                  ? 'Meia' 
                                  : 'Flexível'}
                          </p>
                        </div>
                      </div>
                      <div className="text-xl font-bold">{scorer.goals}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum gol registrado para este período.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Artilharia;
