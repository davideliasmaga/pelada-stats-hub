
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
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Calendar, Users, Trash2 } from "lucide-react";
import { getSupabaseGames, deleteSupabaseGame } from "@/services/supabaseDataService";
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

  const handleDeleteGame = async (gameId: string) => {
    try {
      const success = await deleteSupabaseGame(gameId);
      if (success) {
        setGames(games.filter(game => game.id !== gameId));
        toast.success('Jogo deletado com sucesso!');
      } else {
        toast.error('Erro ao deletar jogo');
      }
    } catch (error) {
      console.error('Error deleting game:', error);
      toast.error('Erro ao deletar jogo');
    }
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
                    <TableHead>Ações</TableHead>
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
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja deletar este jogo? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteGame(game.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Deletar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
