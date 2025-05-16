
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
import { PieChart, LineChart } from "recharts";
import MainLayout from "@/components/layout/MainLayout";
import { getTransactions, getTotalBalance } from "@/services/dataService";
import { Transaction, TransactionType } from "@/types";
import { useUser } from "@/contexts/UserContext";
import { Navigate } from "react-router-dom";

const Financeiro = () => {
  const { isMensalista } = useUser();
  const transactions = getTransactions();
  const balance = getTotalBalance();
  
  // Redirect if not a mensalista or admin
  if (!isMensalista) {
    return <Navigate to="/" />;
  }

  return (
    <MainLayout>
      <div className="container mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold">Financeiro</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1 md:col-span-3">
            <CardHeader>
              <CardTitle>Saldo Atual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8">
                <h2 className={`text-5xl font-bold ${balance >= 0 ? 'text-grass' : 'text-goal-red'}`}>
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
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(parseISO(transaction.date), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          transaction.type === 'entrada' 
                            ? 'bg-green-100 text-grass' 
                            : 'bg-red-100 text-goal-red'
                        }`}>
                          {transaction.type === 'entrada' ? 'Entrada' : 'Saída'}
                        </span>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${
                        transaction.type === 'entrada' ? 'text-grass' : 'text-goal-red'
                      }`}>
                        {transaction.type === 'entrada' ? '+' : '-'} 
                        {transaction.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
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
