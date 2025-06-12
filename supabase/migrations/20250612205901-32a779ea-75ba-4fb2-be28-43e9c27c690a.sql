
-- Remover TODAS as políticas RLS existentes que podem estar causando recursão
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view basic profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Remover políticas de outras tabelas que podem estar causando problemas
DROP POLICY IF EXISTS "Anyone can view players" ON public.players;
DROP POLICY IF EXISTS "Authenticated users can insert players" ON public.players;
DROP POLICY IF EXISTS "Authenticated users can update players" ON public.players;
DROP POLICY IF EXISTS "Authenticated users can delete players" ON public.players;

DROP POLICY IF EXISTS "Anyone can view games" ON public.games;
DROP POLICY IF EXISTS "Authenticated users can insert games" ON public.games;
DROP POLICY IF EXISTS "Authenticated users can update games" ON public.games;

DROP POLICY IF EXISTS "Anyone can view transactions" ON public.transactions;
DROP POLICY IF EXISTS "Authenticated users can insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "Authenticated users can update transactions" ON public.transactions;
DROP POLICY IF EXISTS "Authenticated users can delete transactions" ON public.transactions;

DROP POLICY IF EXISTS "Anyone can view goals" ON public.goals;
DROP POLICY IF EXISTS "Authenticated users can insert goals" ON public.goals;
DROP POLICY IF EXISTS "Authenticated users can update goals" ON public.goals;

DROP POLICY IF EXISTS "Anyone can view game_players" ON public.game_players;
DROP POLICY IF EXISTS "Authenticated users can insert game_players" ON public.game_players;

-- DESABILITAR RLS em todas as tabelas temporariamente para eliminar recursão
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.players DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.games DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_players DISABLE ROW LEVEL SECURITY;

-- Recriar políticas MUITO SIMPLES que não causam recursão
-- Para transactions - permitir tudo para usuários autenticados
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users" 
  ON public.transactions 
  FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Para players - permitir tudo para usuários autenticados
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users" 
  ON public.players 
  FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Para games - permitir tudo para usuários autenticados
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users" 
  ON public.games 
  FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Para goals - permitir tudo para usuários autenticados
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users" 
  ON public.goals 
  FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Para game_players - permitir tudo para usuários autenticados
ALTER TABLE public.game_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users" 
  ON public.game_players 
  FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Para profiles - política muito simples sem recursão
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users" 
  ON public.profiles 
  FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
