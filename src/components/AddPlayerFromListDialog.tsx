import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

interface AddPlayerFromListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerName: string;
  onPlayerCreated: (player: { id: string; name: string }) => void;
}

const AddPlayerFromListDialog = ({ 
  open, 
  onOpenChange, 
  playerName,
  onPlayerCreated 
}: AddPlayerFromListDialogProps) => {
  const [name, setName] = useState(playerName);
  const [position, setPosition] = useState('atacante');
  const [rating, setRating] = useState('7');
  const [running, setRunning] = useState('medio');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Digite o nome do jogador');
      return;
    }

    try {
      setLoading(true);
      const { data: newPlayer, error } = await supabase
        .from('players')
        .insert({
          name: name.trim(),
          rating: parseFloat(rating),
          position,
          running
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`Jogador ${name} criado com sucesso!`);
      onPlayerCreated(newPlayer);
      onOpenChange(false);
      
      // Reset form
      setName('');
      setPosition('atacante');
      setRating('7');
      setRunning('medio');
    } catch (error: any) {
      console.error('Error creating player:', error);
      toast.error(error.message || 'Erro ao criar jogador');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Novo Jogador</DialogTitle>
          <DialogDescription>
            Preencha os dados do novo jogador para adicioná-lo à base.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="player-name">Nome</Label>
            <Input
              id="player-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do jogador"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="player-position">Posição</Label>
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger id="player-position">
                <SelectValue placeholder="Selecione a posição" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="atacante">Atacante</SelectItem>
                <SelectItem value="defensor">Defensor</SelectItem>
                <SelectItem value="meia">Meia</SelectItem>
                <SelectItem value="flexivel">Flexível</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="player-rating">Rating</Label>
            <Input
              id="player-rating"
              type="number"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="7"
              min="0"
              max="10"
              step="0.1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="player-running">Corrida</Label>
            <Select value={running} onValueChange={setRunning}>
              <SelectTrigger id="player-running">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sim">Sim</SelectItem>
                <SelectItem value="medio">Médio</SelectItem>
                <SelectItem value="nao">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || loading}
          >
            {loading ? 'Criando...' : 'Criar Jogador'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPlayerFromListDialog;
