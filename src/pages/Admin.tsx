
import React, { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import { useUser } from "@/contexts/UserContext";
import { Navigate } from "react-router-dom";
import { UserRole } from "@/types";

// Mock users data for this page
const initialUsers = [
  { id: "1", name: "Admin User", email: "admin@example.com", role: "admin" as UserRole },
  { id: "2", name: "Mensalista User", email: "mensalista@example.com", role: "mensalista" as UserRole },
  { id: "3", name: "Viewer User", email: "viewer@example.com", role: "viewer" as UserRole },
  { id: "4", name: "John Doe", email: "john@example.com", role: "mensalista" as UserRole },
  { id: "5", name: "Jane Smith", email: "jane@example.com", role: "viewer" as UserRole },
];

const getRoleBadge = (role: UserRole) => {
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
  const { isAdmin, currentUser } = useUser();
  const [users, setUsers] = useState(initialUsers);
  
  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    // Don't allow changing your own role
    if (userId === currentUser?.id) {
      toast.error("Você não pode alterar sua própria permissão");
      return;
    }
    
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
    
    toast.success(`Permissão de usuário alterada para ${newRole}`);
  };

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
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      {user.id !== currentUser?.id ? (
                        <Select 
                          defaultValue={user.role}
                          onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Selecionar permissão" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="mensalista">Mensalista</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Button variant="outline" disabled>Usuário atual</Button>
                      )}
                    </TableCell>
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
