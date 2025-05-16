
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTopScorers } from "@/services/dataService";
import { GameType } from "@/types";

// Fixed imports by removing the specific Player type import

const Artilharia = () => {
  const [period, setPeriod] = useState("all");
  const [gameType, setGameType] = useState<GameType | "all">("all");
  const [topScorers, setTopScorers] = useState<Array<{ player: any; goals: number }>>([]);

  useEffect(() => {
    // Get date range based on selected period
    let dateRange;
    const now = new Date();
    
    if (period !== "all") {
      const start = new Date(now);
      
      if (period === "month") {
        start.setMonth(now.getMonth() - 1);
      } else if (period === "quarter") {
        start.setMonth(now.getMonth() - 3);
      } else if (period === "year") {
        start.setFullYear(now.getFullYear() - 1);
      }
      
      dateRange = {
        start: start.toISOString(),
        end: now.toISOString()
      };
    }
    
    // Get filtered top scorers
    const filteredGameType = gameType === "all" ? undefined : gameType as GameType;
    const scorers = getTopScorers(dateRange, filteredGameType);
    setTopScorers(scorers);
  }, [period, gameType]);

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Artilharia</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium mb-2">Período</label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um período" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Todo o período</SelectItem>
                  <SelectItem value="month">Último mês</SelectItem>
                  <SelectItem value="quarter">Último trimestre</SelectItem>
                  <SelectItem value="year">Último ano</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Jogo</label>
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
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary flex-shrink-0">
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
                          className="bg-primary h-2 rounded-full" 
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
