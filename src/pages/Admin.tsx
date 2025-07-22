import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountRequestsManagement from "@/components/AccountRequestsManagement";

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
        
        <Tabs defaultValue="account-requests" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="account-requests">Solicitações de Conta</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account-requests" className="space-y-4">
            <AccountRequestsManagement />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Admin;