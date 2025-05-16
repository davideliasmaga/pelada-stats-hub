
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Plus } from "lucide-react";
import { getPlayers, createPlayer, deletePlayer } from "@/services/dataService";
import { Player, PlayerPosition, RunningAbility } from "@/types";
import { useUser } from "@/contexts/UserContext";
import { Navigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";

const Jogadores = () => {
  const { isAdmin } = useUser();
  const [players, setPlayers] = useState<Player[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form state for new player
  const [playerName, setPlayerName] = useState("");
  const [playerPosition, setPlayerPosition] = useState<PlayerPosition>("flexivel");
  const [playerRunning, setPlayerRunning] = useState<RunningAbility>("medio");
  const [playerRating, setPlayerRating] = useState(7.5);
  
  useEffect(() => {
    setPlayers(getPlayers());
  }, []);
  
  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  const handleAddPlayer = () => {
    if (!playerName) return;

    const newPlayer = createPlayer({
      name: playerName,
      position: playerPosition,
      running: playerRunning,
      rating: playerRating
    });

    setPlayers([...players, newPlayer]);
    
    // Reset form
    setPlayerName("");
    setPlayerPosition("flexivel");
    setPlayerRunning("medio");
    setPlayerRating(7.5);
    setDialogOpen(false);
  };

  const handleDeletePlayer = (id: string) => {
    if (deletePlayer(id)) {
      setPlayers(players.filter(player => player.id !== id));
    }
  };

  const getRunningText = (running: RunningAbility) => {
    switch(running) {
      case "sim": return "Sim";
      case "nao": return "Não";
      case "medio": return "Médio";
      default: return "";
    }
  };

  const getPositionText = (position: PlayerPosition) => {
    switch(position) {
      case "atacante": return "Atacante";
      case "defensor": return "Defensor";
      case "meia": return "Meia";
      case "flexivel": return "Flexível";
      default: return "";
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold">Gerenciar Jogadores</h1>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gray-900 hover:bg-gray-800">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Jogador
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Jogador</DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Nome do jogador"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="position">Posição</Label>
                  <Select 
                    value={playerPosition} 
                    onValueChange={(value) => setPlayerPosition(value as PlayerPosition)}
                  >
                    <SelectTrigger id="position">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="atacante">Atacante</SelectItem>
                        <SelectItem value="meia">Meia</SelectItem>
                        <SelectItem value="defensor">Defensor</SelectItem>
                        <SelectItem value="flexivel">Flexível</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="running">Corre</Label>
                  <Select 
                    value={playerRunning} 
                    onValueChange={(value) => setPlayerRunning(value as RunningAbility)}
                  >
                    <SelectTrigger id="running">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="sim">Sim</SelectItem>
                        <SelectItem value="medio">Médio</SelectItem>
                        <SelectItem value="nao">Não</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rating">Nota ({playerRating.toFixed(1)})</Label>
                  <Slider 
                    id="rating"
                    defaultValue={[7.5]} 
                    min={0} 
                    max={10} 
                    step={0.1}
                    onValueChange={(values) => setPlayerRating(values[0])}
                    className="py-4"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  onClick={handleAddPlayer}
                  className="bg-gray-900 hover:bg-gray-800"
                  disabled={!playerName}
                >
                  Salvar Jogador
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Jogadores Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Posição</TableHead>
                  <TableHead>Corre</TableHead>
                  <TableHead>Nota</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell className="font-medium">{player.name}</TableCell>
                    <TableCell>{getPositionText(player.position)}</TableCell>
                    <TableCell>{getRunningText(player.running)}</TableCell>
                    <TableCell>{player.rating.toFixed(1)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                        onClick={() => handleDeletePlayer(player.id)}
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

export default Jogadores;
