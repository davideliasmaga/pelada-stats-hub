import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserManagement from "@/components/UserManagement";

const Admin = () => {
  const { isAdmin } = useUser();
  
  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return (
    <MainLayout>
      <div className="container mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="users">Gerenciamento de Usuários</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-4">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Admin;