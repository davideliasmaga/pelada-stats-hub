
import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users } from "lucide-react";
import { getSupabaseGames } from "@/services/supabaseDataService";
import { Game } from "@/types";
import { useUser } from "@/contexts/UserContext";
import { Navigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import AddGameDialog from "@/components/AddGameDialog";
import { toast } from "sonner";

const Jogos = () => {
  const { isAdmin } = useUser();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      const data = await getSupabaseGames();
      setGames(data);
    } catch (error) {
      console.error('Error loading games:', error);
      toast.error('Erro ao carregar jogos');
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  const handleGameAdded = () => {
    loadGames(); // Reload games after a new one is added
  };

  const formatGameDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getGameTypeText = (type: string) => {
    return type === 'pelada' ? 'Pelada' : 'Campeonato';
  };

  const getGameTypeBadge = (type: string) => {
    return type === 'pelada' ? 'secondary' : 'default';
  };

  return (
    <MainLayout>
      <div className="container mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold">Gerenciar Jogos</h1>
          <AddGameDialog onGameAdded={handleGameAdded} />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Jogos Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Carregando jogos...</div>
            ) : games.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum jogo cadastrado ainda.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><Calendar className="inline mr-2 h-4 w-4" />Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead><Users className="inline mr-2 h-4 w-4" />Jogadores</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {games.map((game) => (
                    <TableRow key={game.id}>
                      <TableCell className="font-medium">
                        {formatGameDate(game.date)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getGameTypeBadge(game.type)}>
                          {getGameTypeText(game.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          Ver jogadores
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Jogos;
