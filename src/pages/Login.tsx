
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogoWhiteBg } from "@/assets/logo-white-bg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MailIcon, LockIcon, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoggedIn, isLoading: authLoading } = useAuth();
  
  // Check if user is already logged in
  useEffect(() => {
    console.log("Login component: checking auth state", { isLoggedIn, authLoading });
    
    if (authLoading) {
      console.log("Auth is still loading...");
      return;
    }
    
    if (isLoggedIn) {
      console.log("User is logged in, redirecting...");
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [isLoggedIn, authLoading, navigate, location]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt with:", { email });
    setError(null);
    setIsSubmitting(true);
    
    try {
      const success = await login(email, password);
      console.log("Login result:", { success });
      if (!success) {
        setError("Falha ao realizar login. Verifique suas credenciais.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Ocorreu um erro ao processar o login");
    } finally {
      setIsSubmitting(false);
    }
  };

  
  // Show loading state while checking auth
  if (authLoading) {
    console.log("Showing loading state");
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

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
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input 
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com" 
                  className="pl-10" 
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Senha</label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input 
                  id="password"
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********" 
                  className="pl-10" 
                  required
                />
              </div>
            </div>
            
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
            
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta? Entre em contato com o administrador.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
