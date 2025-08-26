-- Create championships table
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

-- Insert initial championship data for 2025
INSERT INTO public.championships (player_id, year, date) VALUES
-- Get player IDs and insert championships
((SELECT id FROM public.players WHERE name = 'Igor' LIMIT 1), 2025, '2025-01-01'),
((SELECT id FROM public.players WHERE name = 'Igor' LIMIT 1), 2025, '2025-01-01'),
((SELECT id FROM public.players WHERE name = 'Igor' LIMIT 1), 2025, '2025-01-01'),
((SELECT id FROM public.players WHERE name = 'Rods' LIMIT 1), 2025, '2025-01-01'),
((SELECT id FROM public.players WHERE name = 'Rods' LIMIT 1), 2025, '2025-01-01'),
((SELECT id FROM public.players WHERE name = 'Rods' LIMIT 1), 2025, '2025-01-01'),
((SELECT id FROM public.players WHERE name = 'Bernardo' LIMIT 1), 2025, '2025-01-01'),
((SELECT id FROM public.players WHERE name = 'Bernardo' LIMIT 1), 2025, '2025-01-01'),
((SELECT id FROM public.players WHERE name = 'Bernardo' LIMIT 1), 2025, '2025-01-01'),
((SELECT id FROM public.players WHERE name = 'pedrao' LIMIT 1), 2025, '2025-01-01'),
((SELECT id FROM public.players WHERE name = 'pedrao' LIMIT 1), 2025, '2025-01-01'),
((SELECT id FROM public.players WHERE name = 'pedrao' LIMIT 1), 2025, '2025-01-01'),
((SELECT id FROM public.players WHERE name = 'FJ' LIMIT 1), 2025, '2025-01-01'),
((SELECT id FROM public.players WHERE name = 'FJ' LIMIT 1), 2025, '2025-01-01'),
((SELECT id FROM public.players WHERE name = 'FJ' LIMIT 1), 2025, '2025-01-01'),
((SELECT id FROM public.players WHERE name = 'Gsilva' LIMIT 1), 2025, '2025-01-01'),
((SELECT id FROM public.players WHERE name = 'Gsilva' LIMIT 1), 2025, '2025-01-01'),
((SELECT id FROM public.players WHERE name = 'Victor' LIMIT 1), 2025, '2025-01-01'),
((SELECT id FROM public.players WHERE name = 'Victor' LIMIT 1), 2025, '2025-01-01'),
((SELECT id FROM public.players WHERE name = 'Guima' LIMIT 1), 2025, '2025-01-01'),
((SELECT id FROM public.players WHERE name = 'Guima' LIMIT 1), 2025, '2025-01-01'),
((SELECT id FROM public.players WHERE name = 'Quati' LIMIT 1), 2025, '2025-01-01'),
((SELECT id FROM public.players WHERE name = 'gabrao' LIMIT 1), 2025, '2025-01-01'),
((SELECT id FROM public.players WHERE name = 'Lara' LIMIT 1), 2025, '2025-01-01'),
((SELECT id FROM public.players WHERE name = 'Fael' LIMIT 1), 2025, '2025-01-01'),
((SELECT id FROM public.players WHERE name = 'Kadim' LIMIT 1), 2025, '2025-01-01'),
((SELECT id FROM public.players WHERE name = 'Keller' LIMIT 1), 2025, '2025-01-01'),
((SELECT id FROM public.players WHERE name = 'Joao M' LIMIT 1), 2025, '2025-01-01'),
((SELECT id FROM public.players WHERE name = 'Joao' LIMIT 1), 2025, '2025-01-01'),
((SELECT id FROM public.players WHERE name = 'Ameba' LIMIT 1), 2025, '2025-01-01'),
((SELECT id FROM public.players WHERE name = 'Yago' LIMIT 1), 2025, '2025-01-01'),
((SELECT id FROM public.players WHERE name = 'Rod' LIMIT 1), 2025, '2025-01-01');