-- Desabilitar RLS temporariamente para limpar tudo
ALTER TABLE public.account_requests DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "admins_full_access" ON public.account_requests;
DROP POLICY IF EXISTS "public_insert_requests" ON public.account_requests;
DROP POLICY IF EXISTS "users_view_own_requests" ON public.account_requests;

-- Reabilitar RLS
ALTER TABLE public.account_requests ENABLE ROW LEVEL SECURITY;

-- Criar política simples que permite tudo para usuários autenticados que são admin
CREATE POLICY "admin_access_all" 
ON public.account_requests 
FOR ALL
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Criar política que permite inserção para qualquer um (incluindo usuários não autenticados)
CREATE POLICY "allow_insert_for_registration" 
ON public.account_requests 
FOR INSERT
WITH CHECK (true);