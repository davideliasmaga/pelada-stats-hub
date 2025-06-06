
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { createSupabaseTransaction } from "@/services/supabaseDataService";
import { TransactionType } from "@/types";
import { toast } from "sonner";

interface AddTransactionDialogProps {
  onTransactionAdded: () => void;
}

const AddTransactionDialog = ({ onTransactionAdded }: AddTransactionDialogProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transactionDate, setTransactionDate] = useState('');
  const [transactionType, setTransactionType] = useState<TransactionType>('entrada');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveTransaction = async () => {
    if (!transactionDate || !amount || !description) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      toast.error('Valor deve ser um número válido maior que zero');
      return;
    }

    try {
      setLoading(true);
      console.log('Saving transaction...', {
        date: transactionDate,
        type: transactionType,
        amount: amountNumber,
        description
      });
      
      await createSupabaseTransaction({
        date: transactionDate,
        type: transactionType,
        amount: amountNumber,
        description
      });
      
      toast.success('Transação salva com sucesso!');
      onTransactionAdded();
      
      // Reset form
      setTransactionDate('');
      setTransactionType('entrada');
      setAmount('');
      setDescription('');
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving transaction:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao salvar transação';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gray-900 hover:bg-gray-800">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Transação
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Transação</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select value={transactionType} onValueChange={(value) => setTransactionType(value as TransactionType)}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">Entrada</SelectItem>
                <SelectItem value="saida">Saída</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição da transação"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            onClick={handleSaveTransaction}
            className="bg-gray-900 hover:bg-gray-800"
            disabled={!transactionDate || !amount || !description || loading}
          >
            {loading ? 'Salvando...' : 'Salvar Transação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionDialog;
