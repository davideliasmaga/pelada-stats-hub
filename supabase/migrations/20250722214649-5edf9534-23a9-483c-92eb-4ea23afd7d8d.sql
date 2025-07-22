-- Fix function search path security issues
CREATE OR REPLACE FUNCTION public.update_account_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;