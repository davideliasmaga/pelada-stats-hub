
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, BarChart, Settings, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSupabaseTransactions, getSupabaseGoals, getSupabasePlayers, getSupabaseGames } from "@/services/supabaseDataService";
import MainLayout from "@/components/layout/MainLayout";
import { useUser } from "@/contexts/UserContext";
import { LogoWhiteBg } from "@/assets/logo-white-bg";
import { Player, Goal, Transaction, Game } from "@/types";
import { generateQuarterPeriods, QuarterPeriod } from "@/utils/quarterPeriods";

const Index = () => {
  const navigate = useNavigate();
  const { isAdmin, isMensalista } = useUser();
  const [topScorers, setTopScorers] = useState<Array<{ player: Player; goals: number }>>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState<Game[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [quarterPeriods, setQuarterPeriods] = useState<QuarterPeriod[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Loading dashboard data...');
      
      // Carregar dados do Supabase com tratamento de erro mais robusto
      const [players, goals, transactions, games] = await Promise.allSettled([
        getSupabasePlayers(),
        getSupabaseGoals(),
        getSupabaseTransactions(),
        getSupabaseGames()
      ]);

      // Processar players
      const playersData = players.status === 'fulfilled' ? players.value : [];
      console.log('Players loaded:', playersData.length);
      setPlayers(playersData);

      // Processar goals
      const goalsData = goals.status === 'fulfilled' ? goals.value : [];
      console.log('Goals loaded:', goalsData.length);
      setGoals(goalsData);

      // Processar transactions
      const transactionsData = transactions.status === 'fulfilled' ? transactions.value : [];
      console.log('Transactions loaded:', transactionsData.length);

      // Processar games
      const gamesData = games.status === 'fulfilled' ? games.value : [];
      console.log('Games loaded:', gamesData.length);
      setGames(gamesData);

      // Gerar períodos de trimestre
      const periods = generateQuarterPeriods(gamesData);
      setQuarterPeriods(periods);
      if (periods.length > 0 && !selectedPeriod) {
        setSelectedPeriod(periods[0].id); // Selecionar o primeiro período (mais recente)
      }

      calculateTopScorers();

      // Calcular saldo financeiro
      if (transactionsData.length > 0) {
        const totalBalance = transactionsData.reduce((total, transaction) => {
          return transaction.type === 'entrada' 
            ? total + transaction.amount
            : total - transaction.amount;
        }, 0);
        setBalance(totalBalance);
      } else {
        setBalance(0);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Definir valores padrão em caso de erro
      setTopScorers([]);
      setBalance(0);
    } finally {
      setLoading(false);
    }
  };

  const calculateTopScorers = () => {
    if (players.length === 0 || goals.length === 0 || games.length === 0) return;

    const selectedPeriodData = quarterPeriods.find(p => p.id === selectedPeriod);
    
    // Filtrar gols baseado no período selecionado
    const filteredGoals = selectedPeriodData ? goals.filter(goal => {
      const game = games.find(g => g.id === goal.gameId);
      if (!game) return false;
      
      const gameDate = new Date(game.date);
      const periodStart = new Date(selectedPeriodData.start);
      const periodEnd = new Date(selectedPeriodData.end);
      
      return gameDate >= periodStart && gameDate <= periodEnd;
    }) : goals;

    const playerGoals = filteredGoals.reduce((acc, goal) => {
      acc[goal.playerId] = (acc[goal.playerId] || 0) + goal.count;
      return acc;
    }, {} as Record<string, number>);

    const topScorersData = Object.entries(playerGoals)
      .map(([playerId, goalCount]) => {
        const player = players.find(p => p.id === playerId);
        return player ? { player, goals: goalCount } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b!.goals - a!.goals)
      .slice(0, 3) as Array<{ player: Player; goals: number }>;

    setTopScorers(topScorersData);
  };

  // Recalcular quando o período ou dados mudarem
  useEffect(() => {
    calculateTopScorers();
  }, [selectedPeriod, players, goals, games, quarterPeriods]);

  const getPlayerInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  
  const topScorer = topScorers.length > 0 ? topScorers[0] : null;

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-xl text-gray-600">Carregando dados...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto space-y-8">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="flex items-center gap-3">
            <LogoWhiteBg className="h-12 w-12 animate-bounce-subtle" />
            <h1 className="text-4xl font-bold text-gray-900">Pelada Sagaz</h1>
          </div>
          <p className="text-xl text-gray-600 text-center max-w-lg">
            Gerencie suas peladas, acompanhe estatísticas e organize seus jogadores!
          </p>
        </div>

        {topScorer && (
          <div className="mb-8">
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-gray-900 to-gray-700">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Award className="h-5 w-5 text-yellow-400" />
                      Artilheiro
                    </CardTitle>
                    {quarterPeriods.length > 0 && (
                      <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger className="w-48 bg-white text-black">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {quarterPeriods.map((period) => (
                            <SelectItem key={period.id} value={period.id}>
                              {period.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row items-center gap-6 py-4">
                    <div className="relative">
                      <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
                        {topScorer.player.photo ? (
                          <AvatarImage 
                            src={topScorer.player.photo} 
                            alt={topScorer.player.name}
                            className="object-cover" 
                          />
                        ) : (
                          <AvatarFallback className="text-4xl bg-gray-200 text-gray-700">
                            {getPlayerInitials(topScorer.player.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="absolute -bottom-2 -right-2 bg-yellow-500 rounded-full w-10 h-10 flex items-center justify-center border-2 border-white text-lg font-bold">
                        1º
                      </div>
                    </div>
                    
                    <div className="text-center md:text-left text-white">
                      <h2 className="text-2xl font-bold">{topScorer.player.name}</h2>
                      <div className="mt-2">
                        <span className="bg-yellow-500 text-black px-3 py-1 rounded-full font-bold">
                          {topScorer.goals} gols
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-800/50">
                  <Button 
                    onClick={() => navigate('/artilharia')} 
                    variant="outline" 
                    className="w-full bg-white hover:bg-gray-100"
                  >
                    Ver artilharia completa
                  </Button>
                </CardFooter>
              </div>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-gray-500" />
                    Artilharia
                  </CardTitle>
                  <CardDescription>Top 3 artilheiros</CardDescription>
                </div>
                {quarterPeriods.length > 0 && (
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-40">
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
            </CardHeader>
            <CardContent>
              {topScorers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhum gol registrado ainda.
                </div>
              ) : (
                <ul className="space-y-3">
                  {topScorers.map(({ player, goals }, index) => (
                    <li key={player.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            {player.photo ? (
                              <AvatarImage src={player.photo} alt={player.name} />
                            ) : (
                              <AvatarFallback>
                                {getPlayerInitials(player.name)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <span>{player.name}</span>
                        </div>
                      </div>
                      <span className="font-bold">{goals} gols</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => navigate('/artilharia')} 
                variant="outline" 
                className="w-full"
              >
                Ver artilharia completa
              </Button>
            </CardFooter>
          </Card>

          {isMensalista && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-gray-500" />
                  Financeiro
                </CardTitle>
                <CardDescription>Resumo financeiro</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-[100px]">
                  <p className="text-sm">Saldo atual</p>
                  <h3 className={`text-2xl font-bold ${balance >= 0 ? 'text-gray-900' : 'text-red-500'}`}>
                    R$ {balance.toFixed(2)}
                  </h3>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => navigate('/financeiro')} 
                  variant="outline" 
                  className="w-full"
                >
                  Ver detalhes financeiros
                </Button>
              </CardFooter>
            </Card>
          )}

          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-500" />
                  Administração
                </CardTitle>
                <CardDescription>Acesso rápido</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => navigate('/jogadores')} variant="outline" className="w-full">
                  Gerenciar Jogadores
                </Button>
                <Button onClick={() => navigate('/jogos')} variant="outline" className="w-full">
                  Gerenciar Jogos
                </Button>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => navigate('/admin')} 
                  className="w-full bg-gray-900 hover:bg-gray-800"
                >
                  Painel de Administração
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
