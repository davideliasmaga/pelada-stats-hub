-- Fix RLS policy for account_requests to allow unauthenticated users to create requests
DROP POLICY IF EXISTS "Users can view their own account request" ON public.account_requests;

-- Create policy allowing anyone to insert account requests (for registration)
CREATE POLICY "Anyone can create account requests" 
ON public.account_requests 
FOR INSERT
WITH CHECK (true);

-- Create policy for users to view their own requests (but only after they exist in auth.users)
CREATE POLICY "Authenticated users can view their own account request" 
ON public.account_requests 
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND email = (
    SELECT email FROM auth.users WHERE id = auth.uid()
  )
);