import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogoWhiteBg } from "@/assets/logo-white-bg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MailIcon, ArrowLeft, Loader2, LockIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"email" | "password">("email");
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Verificar se o usuário existe
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (error || !data) {
        toast.error("Email não encontrado no sistema.");
        return;
      }

      setUserId(data.id);
      setStep("password");
      toast.success("Email verificado! Agora defina sua nova senha.");
    } catch (err) {
      console.error("Email verification error:", err);
      toast.error("Erro ao verificar email. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Chamar edge function para atualizar senha
      const { data, error } = await supabase.functions.invoke('reset-password', {
        body: { userId, newPassword }
      });

      if (error) {
        console.error("Update password error:", error);
        toast.error("Erro ao atualizar senha. Tente novamente.");
        return;
      }

      if (data?.error) {
        console.error("Update password error:", data.error);
        toast.error(data.error);
        return;
      }

      toast.success("Senha atualizada com sucesso!");
      navigate("/login");
    } catch (err) {
      console.error("Update password exception:", err);
      toast.error("Erro ao processar solicitação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-col justify-center w-full max-w-md mx-auto p-8">
        <div className="flex flex-col items-center mb-10">
          <LogoWhiteBg className="h-16 w-16 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Recuperar Senha</h1>
          <p className="mt-2 text-center text-gray-600">
            {step === "email"
              ? "Digite seu email para continuar"
              : "Digite sua nova senha"}
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-md">
          {step === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
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

              <Button
                type="submit"
                className="w-full bg-gray-900 hover:bg-gray-800"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Continuar"
                )}
              </Button>

              <Button
                type="button"
                variant="link"
                className="w-full text-gray-600 hover:text-gray-900"
                onClick={() => navigate("/login")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para o login
              </Button>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="newPassword" className="text-sm font-medium">
                  Nova Senha
                </label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Digite a senha novamente"
                    className="pl-10"
                    required
                    minLength={6}
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
                    Atualizando...
                  </>
                ) : (
                  "Atualizar senha"
                )}
              </Button>

              <Button
                type="button"
                variant="link"
                className="w-full text-gray-600 hover:text-gray-900"
                onClick={() => {
                  setStep("email");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}