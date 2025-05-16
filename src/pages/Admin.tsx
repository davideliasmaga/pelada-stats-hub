
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import MainLayout from "@/components/layout/MainLayout";
import { useUser } from "@/contexts/UserContext";
import { Navigate } from "react-router-dom";

// Mock users data for this page
const mockUsers = [
  { id: "1", name: "Admin User", email: "admin@example.com", role: "admin" },
  { id: "2", name: "Mensalista User", email: "mensalista@example.com", role: "mensalista" },
  { id: "3", name: "Viewer User", email: "viewer@example.com", role: "viewer" },
  { id: "4", name: "John Doe", email: "john@example.com", role: "mensalista" },
  { id: "5", name: "Jane Smith", email: "jane@example.com", role: "viewer" },
];

const getRoleBadge = (role: string) => {
  switch (role) {
    case "admin":
      return <Badge className="bg-gray-900">Admin</Badge>;
    case "mensalista":
      return <Badge className="bg-gray-600">Mensalista</Badge>;
    case "viewer":
      return <Badge className="bg-gray-400">Viewer</Badge>;
    default:
      return <Badge>Unknown</Badge>;
  }
};

const Admin = () => {
  const { isAdmin } = useUser();
  
  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return (
    <MainLayout>
      <div className="container mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold">Administração</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Usuários Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Permissão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
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

export default Admin;
