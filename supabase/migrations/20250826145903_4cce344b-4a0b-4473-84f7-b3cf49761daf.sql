-- Create championships table only
CREATE TABLE public.championships (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id uuid REFERENCES public.games(id) ON DELETE CASCADE,
  player_id uuid NOT NULL,
  year integer NOT NULL,
  date timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.championships ENABLE ROW LEVEL SECURITY;

-- Create policy for championships
CREATE POLICY "championships_authenticated_access" 
ON public.championships 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);