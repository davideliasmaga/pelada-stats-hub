-- RESOLVER DEFINITIVAMENTE O PROBLEMA DE RLS

-- 1. Primeiro, vamos desabilitar RLS para limpar tudo
ALTER TABLE public.account_requests DISABLE ROW LEVEL SECURITY;

-- 2. Apagar TODAS as políticas existentes
DROP POLICY IF EXISTS "admin_access_all" ON public.account_requests;
DROP POLICY IF EXISTS "allow_insert_for_registration" ON public.account_requests;

-- 3. Reabilitar RLS
ALTER TABLE public.account_requests ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas com roles corretos do Supabase

-- Política para permitir que usuários autenticados que são admin vejam/editem tudo
CREATE POLICY "authenticated_admin_full_access" 
ON public.account_requests 
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Política para permitir que QUALQUER PESSOA (anon/authenticated) insira registros
CREATE POLICY "public_can_insert" 
ON public.account_requests 
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Política para usuários autenticados verem suas próprias solicitações
CREATE POLICY "users_own_requests" 
ON public.account_requests 
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email = account_requests.email
  )
);