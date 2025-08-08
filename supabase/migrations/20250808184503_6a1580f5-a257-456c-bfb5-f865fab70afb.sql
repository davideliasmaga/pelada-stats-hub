-- Create account_requests table to handle new user requests
CREATE TABLE public.account_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'viewer',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.account_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for account_requests
CREATE POLICY "Users can view account requests" 
ON public.account_requests 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create account requests" 
ON public.account_requests 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update account requests" 
ON public.account_requests 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_account_requests_updated_at
BEFORE UPDATE ON public.account_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();