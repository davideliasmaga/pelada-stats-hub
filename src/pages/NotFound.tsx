
import React from "react";
import { useNavigate } from "react-router-dom";
import { Dribbble } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center space-y-6 max-w-md mx-auto p-6">
        <div className="flex items-center justify-center">
          <Dribbble className="h-20 w-20 text-gray-800 animate-bounce-subtle" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <h2 className="text-2xl font-semibold">Página não encontrada</h2>
        <p className="text-gray-600">
          Parece que esta página saiu dos limites do campo.
          Vamos voltar para o jogo principal?
        </p>
        <Button 
          onClick={() => navigate("/")} 
          size="lg"
          className="rounded-full bg-gray-900 hover:bg-gray-800"
        >
          Voltar para a Página Inicial
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
