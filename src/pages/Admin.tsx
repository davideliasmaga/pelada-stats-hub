import React, { useState, useEffect } from "react";
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
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { UserRole, User } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Copy, UserPlus, Loader2, AlertCircle } from "lucide-react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

// Form schema for adding new users
const newUserSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres",
  }),
  email: z.string().email({
    message: "Email inválido",
  }),
  role: z.enum(["admin", "mensalista", "viewer"]),
});

type NewUserFormValues = z.infer<typeof newUserSchema>;

const Admin = () => {
  const { currentUser } = useUser();
  const { approveUser, rejectUser, getPendingUsers } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState<string | null>(null);
  const [isRejecting, setIsRejecting] = useState<string | null>(null);

  // Redirect if not admin
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadPendingUsers();
  }, []);

  const loadPendingUsers = async () => {
    setIsLoading(true);
    try {
      const users = await getPendingUsers();
      setPendingUsers(users);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (userId: string, role: UserRole) => {
    setIsApproving(userId);
    try {
      const success = await approveUser(userId, role);
      if (success) {
        await loadPendingUsers();
      }
    } finally {
      setIsApproving(null);
    }
  };

  const handleReject = async (userId: string) => {
    setIsRejecting(userId);
    try {
      const success = await rejectUser(userId);
      if (success) {
        await loadPendingUsers();
      }
    } finally {
      setIsRejecting(null);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Administração</h1>

        <Tabs defaultValue="pending-users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending-users">Usuários Pendentes</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
          </TabsList>

          <TabsContent value="pending-users">
            <Card>
              <CardHeader>
                <CardTitle>Usuários Pendentes de Aprovação</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                  </div>
                ) : pendingUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Não há usuários pendentes de aprovação
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Função</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Select
                              defaultValue="viewer"
                              onValueChange={(value) => handleApprove(user.id, value as UserRole)}
                              disabled={isApproving === user.id || isRejecting === user.id}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Selecione a função" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="mensalista">Mensalista</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleReject(user.id)}
                              disabled={isApproving === user.id || isRejecting === user.id}
                            >
                              {isRejecting === user.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Rejeitando...
                                </>
                              ) : (
                                "Rejeitar"
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {initialUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={
                            user.role === 'admin' ? 'destructive' :
                            user.role === 'mensalista' ? 'default' :
                            'secondary'
                          }>
                            {user.role === 'admin' ? 'Admin' :
                             user.role === 'mensalista' ? 'Mensalista' :
                             'Viewer'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Aprovado
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Admin;
