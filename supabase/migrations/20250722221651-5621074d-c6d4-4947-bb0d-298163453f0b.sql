-- Remove todas as políticas existentes da tabela account_requests
DROP POLICY IF EXISTS "Admin can manage account requests" ON public.account_requests;
DROP POLICY IF EXISTS "Anyone can create account requests" ON public.account_requests;
DROP POLICY IF EXISTS "Authenticated users can view their own account request" ON public.account_requests;
DROP POLICY IF EXISTS "Users can view their own account request" ON public.account_requests;

-- Criar política simples e funcional para admins
CREATE POLICY "admins_full_access" 
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

-- Criar política para qualquer um inserir (registro)
CREATE POLICY "public_insert_requests" 
ON public.account_requests 
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Criar política para usuários autenticados verem suas próprias solicitações
CREATE POLICY "users_view_own_requests" 
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