
import React, { useState, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LogoWhiteBg } from "@/assets/logo-white-bg";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MailIcon, LockIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(1, { message: "Senha é obrigatória" }),
});

type LoginValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { isLoggedIn, isLoading, login, requestPasswordReset } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "davideliasmagalhaes@gmail.com",
      password: "admin123456",
    },
  });
  
  // If already logged in, redirect to home
  if (isLoggedIn && !isLoading) {
    const from = location.state?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  const onSubmit = async (values: LoginValues) => {
    setLoginError(null);
    setIsSubmitting(true);
    
    try {
      console.log("Submitting login form with:", values.email);
      const success = await login(values.email, values.password);
      
      if (success) {
        console.log("Login successful, navigating...");
        // Navigate to the previous page or home
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
      } else {
        console.log("Login failed");
        setLoginError("Falha ao realizar login. Verifique suas credenciais.");
      }
    } catch (error) {
      console.error("Login submission error:", error);
      setLoginError("Ocorreu um erro ao processar o login. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestReset = async () => {
    if (!resetEmail) return;
    
    setIsResetting(true);
    try {
      await requestPasswordReset(resetEmail);
      toast.success(`Link de redefinição enviado para ${resetEmail}`);
      setResetDialogOpen(false);
      setResetEmail("");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-col justify-center w-full max-w-md mx-auto p-8">
        <div className="flex flex-col items-center mb-10">
          <LogoWhiteBg className="h-16 w-16 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Pelada Sagaz</h1>
          <p className="mt-2 text-center text-gray-600">
            Faça login para acessar a plataforma
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-md">
          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {loginError}
            </div>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MailIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input 
                          placeholder="seu@email.com" 
                          className="pl-10" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <LockIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input 
                          type="password" 
                          placeholder="********" 
                          className="pl-10" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-4">
                <Button 
                  type="submit" 
                  className="w-full bg-gray-900 hover:bg-gray-800"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>

                <div className="flex flex-col gap-2">
                  <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        type="button" 
                        variant="link" 
                        className="w-full text-gray-600 hover:text-gray-900"
                      >
                        Esqueci minha senha
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Redefinir Senha</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <p className="text-sm text-gray-500">
                          Digite seu email para receber um link de redefinição de senha.
                        </p>
                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setResetDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="button"
                          className="bg-gray-900 hover:bg-gray-800"
                          onClick={handleRequestReset}
                          disabled={isResetting || !resetEmail}
                        >
                          {isResetting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            "Enviar Link"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button
                    type="button"
                    variant="link"
                    className="w-full text-gray-600 hover:text-gray-900"
                    onClick={() => navigate("/register")}
                  >
                    Criar uma conta
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
        
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Usuário padrão: davideliasmagalhaes@gmail.com</p>
          <p>Senha padrão: admin123456</p>
          <p className="mt-2 text-red-500 font-semibold">
            Se ainda não conseguir fazer login, pode ser necessário resetar a senha.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
