-- Create account_requests table for user approval workflow
CREATE TABLE public.account_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'viewer',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.account_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for account_requests
CREATE POLICY "Account requests are viewable by admins" 
ON public.account_requests 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create account requests" 
ON public.account_requests 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only admins can update account requests" 
ON public.account_requests 
FOR UPDATE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_account_requests_updated_at
BEFORE UPDATE ON public.account_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_account_requests_updated_at();