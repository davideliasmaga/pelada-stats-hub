
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
  const { isAdmin, currentUser } = useUser();
  const [users, setUsers] = useState(initialUsers);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  
  // Form for inviting new users
  const form = useForm<NewUserFormValues>({
    resolver: zodResolver(newUserSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "viewer",
    },
  });
  
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
  
  const handleInviteUser = (values: NewUserFormValues) => {
    // Check if email already exists
    if (users.some(user => user.email === values.email)) {
      toast.error("Este email já está cadastrado");
      return;
    }
    
    // Add new user
    const newUser = {
      id: `${users.length + 1}`,
      name: values.name,
      email: values.email,
      role: values.role,
    };
    
    setUsers([...users, newUser]);
    setInviteDialogOpen(false);
    form.reset();
    
    toast.success(`Usuário ${values.name} convidado com sucesso`);
  };

  return (
    <MainLayout>
      <div className="container mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold">Administração</h1>
          
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gray-900 hover:bg-gray-800">
                <UserPlus className="mr-2 h-4 w-4" />
                Convidar Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Convidar Novo Usuário</DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleInviteUser)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do usuário" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@exemplo.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Permissão</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecionar permissão" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="mensalista">Mensalista</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter className="pt-4">
                    <Button type="submit" className="bg-gray-900 hover:bg-gray-800">
                      Convidar
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
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
