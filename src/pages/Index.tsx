
import React from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, BarChart, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getTopScorers, getTotalBalance } from "@/services/dataService";
import MainLayout from "@/components/layout/MainLayout";
import { useUser } from "@/contexts/UserContext";
import { LogoWhiteBg } from "@/assets/logo-white-bg";

const Index = () => {
  const navigate = useNavigate();
  const { isAdmin, isMensalista } = useUser();
  const topScorers = getTopScorers().slice(0, 3);
  const balance = getTotalBalance();

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-gray-500" />
                Artilharia
              </CardTitle>
              <CardDescription>Top 3 artilheiros</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {topScorers.map(({ player, goals }, index) => (
                  <li key={player.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-800">
                        {index + 1}
                      </div>
                      <span>{player.name}</span>
                    </div>
                    <span className="font-bold">{goals} gols</span>
                  </li>
                ))}
              </ul>
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
