import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AddChampionshipDialog from '@/components/AddChampionshipDialog';
import { Player, Championship } from '@/types';
import { getSupabasePlayers } from '@/services/supabaseDataService';
import { getSupabaseChampionships } from '@/services/championshipService';
import { useUser } from '@/contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Campeonatos = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    
    const fetchData = async () => {
      try {
        const [playersData, championshipsData] = await Promise.all([
          getSupabasePlayers(),
          getSupabaseChampionships()
        ]);
        setPlayers(playersData);
        setChampionships(championshipsData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin, navigate]);

  const getPlayerInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getChampionshipRanking = () => {
    const filteredChampionships = championships.filter(championship => championship.year === selectedYear);
    
    const ranking = filteredChampionships.reduce((acc, championship) => {
      const player = players.find(p => p.id === championship.playerId);
      if (player) {
        acc[player.id] = acc[player.id] || { player, count: 0 };
        acc[player.id].count++;
      }
      return acc;
    }, {} as Record<string, { player: Player; count: number }>);

    return Object.values(ranking)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  const handleAddChampionship = async (championship: Omit<Championship, 'id'>) => {
    try {
      const { createSupabaseChampionship } = await import('@/services/championshipService');
      const newChampionship = await createSupabaseChampionship(championship);
      setChampionships([...championships, newChampionship]);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Erro ao adicionar campeonato:', error);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Carregando...</div>
        </div>
      </MainLayout>
    );
  }

  const ranking = getChampionshipRanking();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Campeonatos</h1>
          {isAdmin && (
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Campeonato
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <label htmlFor="year-select" className="text-sm font-medium">
            Filtrar por ano:
          </label>
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ranking de Campeões {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            {ranking.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhum campeonato encontrado para {selectedYear}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Pos.</TableHead>
                    <TableHead>Jogador</TableHead>
                    <TableHead className="text-right">Campeonatos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ranking.map((entry, index) => (
                    <TableRow key={entry.player.id}>
                      <TableCell className="font-medium">{index + 1}º</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={entry.player.photo} alt={entry.player.name} />
                            <AvatarFallback className="text-xs">
                              {getPlayerInitials(entry.player.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{entry.player.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">{entry.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <AddChampionshipDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onAdd={handleAddChampionship}
          players={players}
        />
      </div>
    </MainLayout>
  );
};

export default Campeonatos;