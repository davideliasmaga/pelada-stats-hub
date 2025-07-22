-- Create account requests table for pending user registrations
CREATE TABLE public.account_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'mensalista', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.account_requests ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access to account requests
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

-- Create policy for users to view their own request
CREATE POLICY "Users can view their own account request" 
ON public.account_requests 
FOR SELECT
USING (auth.jwt() ->> 'email' = email);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_account_requests_updated_at()
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
  EXECUTE FUNCTION public.update_account_requests_updated_at();