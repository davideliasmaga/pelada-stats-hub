import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Image } from "lucide-react";
import { Player, PlayerPosition, RunningAbility } from "@/types";

interface EditPlayerDialogProps {
  player: Player;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedPlayer: Player) => void;
}

const EditPlayerDialog = ({ player, open, onOpenChange, onSave }: EditPlayerDialogProps) => {
  const [playerName, setPlayerName] = useState(player.name);
  const [playerPosition, setPlayerPosition] = useState<PlayerPosition>(player.position);
  const [playerRunning, setPlayerRunning] = useState<RunningAbility>(player.running);
  const [playerRating, setPlayerRating] = useState(player.rating);
  const [playerPhoto, setPlayerPhoto] = useState<string>(player.photo || "");

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPlayerPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const updatedPlayer: Player = {
      ...player,
      name: playerName,
      position: playerPosition,
      running: playerRunning,
      rating: playerRating,
      photo: playerPhoto
    };
    onSave(updatedPlayer);
    onOpenChange(false);
  };

  const getPlayerInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Jogador</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                {playerPhoto ? (
                  <AvatarImage src={playerPhoto} alt="Player" />
                ) : (
                  <AvatarFallback className="bg-gray-200">
                    {playerName ? getPlayerInitials(playerName) : <User className="h-12 w-12 text-gray-500" />}
                  </AvatarFallback>
                )}
              </Avatar>
              <label 
                htmlFor="edit-photo-upload" 
                className="absolute -bottom-2 -right-2 bg-gray-900 rounded-full p-1 cursor-pointer hover:bg-gray-700 transition-colors"
              >
                <Image className="h-4 w-4 text-white" />
                <input 
                  id="edit-photo-upload" 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome</Label>
            <Input
              id="edit-name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Nome do jogador"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-position">Posição</Label>
            <Select 
              value={playerPosition} 
              onValueChange={(value) => setPlayerPosition(value as PlayerPosition)}
            >
              <SelectTrigger id="edit-position">
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
            <Label htmlFor="edit-running">Corre</Label>
            <Select 
              value={playerRunning} 
              onValueChange={(value) => setPlayerRunning(value as RunningAbility)}
            >
              <SelectTrigger id="edit-running">
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
            <Label htmlFor="edit-rating">Nota ({playerRating.toFixed(1)})</Label>
            <Slider 
              id="edit-rating"
              value={[playerRating]} 
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
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gray-900 hover:bg-gray-800"
            disabled={!playerName}
          >
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPlayerDialog;