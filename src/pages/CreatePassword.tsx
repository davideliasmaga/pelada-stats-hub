
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LockIcon, Loader2 } from "lucide-react";

const passwordSchema = z.object({
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
  confirmPassword: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não correspondem",
  path: ["confirmPassword"],
});

type PasswordValues = z.infer<typeof passwordSchema>;

const CreatePassword = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";
  const { createPassword } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: PasswordValues) => {
    if (!email || !token) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      const success = await createPassword(email, token, values.password);
      if (success) {
        navigate("/login", { replace: true });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // If no email or token, show error
  if (!email || !token) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex flex-col justify-center w-full max-w-md mx-auto p-8">
          <div className="flex flex-col items-center mb-10">
            <LogoWhiteBg className="h-16 w-16 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Pelada Sagaz</h1>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-md text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">Link Inválido</h2>
            <p className="text-gray-600 mb-6">
              Este link de convite é inválido ou expirou. Por favor, solicite um novo convite ao administrador.
            </p>
            <Button 
              onClick={() => navigate("/login")}
              className="bg-gray-900 hover:bg-gray-800"
            >
              Voltar para Login
            </Button>
          </div>
        </div>
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
            Crie sua senha para acessar a plataforma
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-md">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <h2 className="text-lg font-medium mb-2">Criação de Senha</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Olá! Você foi convidado para acessar o Pelada Sagaz. Por favor, crie uma senha para continuar.
                </p>
                <div className="bg-gray-100 p-3 rounded-md mb-6">
                  <p className="text-sm font-medium">Email: {email}</p>
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <LockIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input 
                          type="password" 
                          placeholder="Digite sua senha" 
                          className="pl-10" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Mínimo de 6 caracteres
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirme a Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <LockIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input 
                          type="password" 
                          placeholder="Confirme sua senha" 
                          className="pl-10" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-gray-900 hover:bg-gray-800"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando senha...
                  </>
                ) : (
                  "Criar Senha e Entrar"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CreatePassword;
