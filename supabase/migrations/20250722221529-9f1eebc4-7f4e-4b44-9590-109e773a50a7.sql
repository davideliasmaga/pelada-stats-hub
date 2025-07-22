-- Fix RLS policies for account_requests - remove reference to non-existent table
DROP POLICY IF EXISTS "Admin can manage account requests" ON public.account_requests;

-- Create correct policy for admin access using profiles table
CREATE POLICY "Admin can manage account requests" 
ON public.account_requests 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Also ensure anyone can insert account requests (for registration)
DROP POLICY IF EXISTS "Anyone can create account requests" ON public.account_requests;

CREATE POLICY "Anyone can create account requests" 
ON public.account_requests 
FOR INSERT
WITH CHECK (true);