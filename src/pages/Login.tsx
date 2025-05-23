
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogoWhiteBg } from "@/assets/logo-white-bg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MailIcon, LockIcon, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function Login() {
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("davideliasmagalhaes@gmail.com");
  const [password, setPassword] = useState("admin123456");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          navigate("/");
        } 
      } catch (err) {
        console.error("Session check error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, [navigate]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        setError(error.message);
        toast.error(`Erro no login: ${error.message}`);
      } else if (data.session) {
        toast.success('Login realizado com sucesso!');
        navigate("/", { replace: true });
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao processar o login");
      toast.error('Erro ao realizar login');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Show loading state
  if (isLoading) {
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
            {/* Email field */}
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
            
            {/* Password field */}
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
            
            {/* Login button */}
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
            
            {/* Helper links */}
            <div className="flex flex-col gap-2">
              <Button 
                type="button" 
                variant="link" 
                className="w-full text-gray-600 hover:text-gray-900"
                onClick={() => navigate("/register")}
              >
                Criar uma conta
              </Button>
            </div>
          </form>
        </div>
        
        {/* Login help */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Usuário padrão: davideliasmagalhaes@gmail.com</p>
          <p>Senha padrão: admin123456</p>
        </div>
      </div>
    </div>
  );
}
