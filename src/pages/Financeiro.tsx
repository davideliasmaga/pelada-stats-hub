
import React, { useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { getTransactions, getTotalBalance, createTransaction, clearTransactions } from "@/services/dataService";
import { Transaction, TransactionType } from "@/types";
import { useUser } from "@/contexts/UserContext";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";

const Financeiro = () => {
  const { isMensalista, isAdmin } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>(getTransactions());
  const [balance, setBalance] = useState<number>(getTotalBalance());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  // Form state for new transaction
  const [transactionDate, setTransactionDate] = useState<Date | undefined>(new Date());
  const [transactionType, setTransactionType] = useState<TransactionType>("entrada");
  const [transactionAmount, setTransactionAmount] = useState<string>("");
  const [transactionDescription, setTransactionDescription] = useState<string>("");
  
  // Redirect if not a mensalista or admin
  if (!isMensalista) {
    return <Navigate to="/" />;
  }

  const handleSaveTransaction = () => {
    if (!transactionDate || !transactionAmount || !transactionDescription) return;

    const amount = parseFloat(transactionAmount);
    if (isNaN(amount) || amount <= 0) return;

    const newTransaction = createTransaction({
      date: transactionDate.toISOString(),
      type: transactionType,
      amount,
      description: transactionDescription
    });

    // Update state
    setTransactions([newTransaction, ...transactions]);
    setBalance(getTotalBalance());
    
    // Reset form
    setTransactionDate(new Date());
    setTransactionType("entrada");
    setTransactionAmount("");
    setTransactionDescription("");
    setDialogOpen(false);
    
    toast.success("Transação adicionada com sucesso!");
  };
  
  const handleClearTransactions = () => {
    clearTransactions();
    setTransactions([]);
    setBalance(0);
    setClearDialogOpen(false);
    toast.success("Todas as transações foram removidas!");
  };

  return (
    <MainLayout>
      <div className="container mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold">Financeiro</h1>
          
          <div className="flex gap-2">
            {isAdmin && (
              <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Limpar Transações
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Limpar Todas as Transações</DialogTitle>
                    <DialogDescription>
                      Esta ação irá remover todas as transações registradas. Esta ação não pode ser desfeita.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={() => setClearDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={handleClearTransactions}
                    >
                      Confirmar Exclusão
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            
            {isAdmin && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gray-900 hover:bg-gray-800">
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Transação
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Nova Transação</DialogTitle>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Data</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left",
                              !transactionDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {transactionDate ? (
                              format(transactionDate, "PPP", { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={transactionDate}
                            onSelect={setTransactionDate}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo</Label>
                      <Select 
                        value={transactionType} 
                        onValueChange={(value) => setTransactionType(value as TransactionType)}
                      >
                        <SelectTrigger id="type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="entrada">Entrada</SelectItem>
                            <SelectItem value="saida">Saída</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="amount">Valor (R$)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={transactionAmount}
                        onChange={(e) => setTransactionAmount(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Input
                        id="description"
                        value={transactionDescription}
                        onChange={(e) => setTransactionDescription(e.target.value)}
                        placeholder="Descrição da transação"
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button
                      onClick={handleSaveTransaction}
                      className="bg-gray-900 hover:bg-gray-800"
                      disabled={
                        !transactionDate || 
                        !transactionAmount || 
                        !transactionDescription || 
                        parseFloat(transactionAmount) <= 0
                      }
                    >
                      Salvar Transação
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1 md:col-span-3">
            <CardHeader>
              <CardTitle>Saldo Atual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8">
                <h2 className={`text-5xl font-bold ${balance >= 0 ? 'text-gray-900' : 'text-red-500'}`}>
                  R$ {balance.toFixed(2)}
                </h2>
                <p className="text-muted-foreground mt-2">
                  {balance >= 0 ? 'Saldo Positivo' : 'Saldo Negativo'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1 md:col-span-3">
            <CardHeader>
              <CardTitle>Histórico de Transações</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Valor (R$)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Nenhuma transação registrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {format(parseISO(transaction.date), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            transaction.type === 'entrada' 
                              ? 'bg-gray-200 text-gray-900' 
                              : 'bg-red-100 text-red-500'
                          }`}>
                            {transaction.type === 'entrada' ? 'Entrada' : 'Saída'}
                          </span>
                        </TableCell>
                        <TableCell className={`text-right font-medium ${
                          transaction.type === 'entrada' ? 'text-gray-900' : 'text-red-500'
                        }`}>
                          {transaction.type === 'entrada' ? '+' : '-'} 
                          {transaction.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Financeiro;
