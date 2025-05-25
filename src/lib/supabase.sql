-- Configuração inicial do search_path
alter database postgres set search_path to "$user", public;

-- Função para criar usuário com search_path explícito
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, email, role, is_approved)
  values (new.id, new.raw_user_meta_data->>'name', new.email, 'viewer', false);
  return new;
end;
$$;

-- Trigger para criar usuário
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Função para aprovar usuário com search_path explícito
create or replace function public.approve_user(user_id uuid, new_role text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  _user_exists boolean;
begin
  -- Verifica se o usuário existe
  select exists(select 1 from public.users where id = user_id) into _user_exists;
  if not _user_exists then
    return false;
  end if;

  -- Atualiza o usuário
  update public.users
  set is_approved = true,
      role = new_role::text
  where id = user_id;

  return true;
end;
$$;

-- Função para rejeitar usuário com search_path explícito
create or replace function public.reject_user(user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  _user_exists boolean;
begin
  -- Verifica se o usuário existe
  select exists(select 1 from public.users where id = user_id) into _user_exists;
  if not _user_exists then
    return false;
  end if;

  -- Remove o usuário
  delete from auth.users where id = user_id;
  delete from public.users where id = user_id;

  return true;
end;
$$;

-- Função para criar auth_user com search_path explícito
create or replace function public.create_auth_user(
  p_email text,
  p_password text,
  p_name text,
  p_role text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  -- Insere na tabela de usuários primeiro
  insert into public.users (name, email, role, is_approved)
  values (p_name, p_email, p_role::text, true)
  returning id into v_user_id;

  -- Insere na tabela de autenticação
  insert into public.auth_users (email, password, user_id)
  values (p_email, p_password, v_user_id);

  return v_user_id;
end;
$$;

-- Função para atualizar senha com search_path explícito
create or replace function public.update_user_password(
  p_user_id uuid,
  p_new_password text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.auth_users
  set password = p_new_password
  where user_id = p_user_id;

  return found;
end;
$$;

-- Função para resetar senha com search_path explícito
create or replace function public.reset_user_password(
  p_email text,
  p_reset_token text,
  p_new_password text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  -- Busca o user_id pelo email
  select id into v_user_id
  from public.users
  where email = p_email;

  if v_user_id is null then
    return false;
  end if;

  -- Atualiza a senha e limpa o token
  update public.auth_users
  set password = p_new_password,
      reset_token = null
  where user_id = v_user_id
    and reset_token = p_reset_token;

  return found;
end;
$$;

-- Função para solicitar reset de senha com search_path explícito
create or replace function public.request_password_reset(
  p_email text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_reset_token text;
begin
  -- Busca o user_id pelo email
  select id into v_user_id
  from public.users
  where email = p_email;

  if v_user_id is null then
    return null;
  end if;

  -- Gera um token aleatório
  v_reset_token := encode(gen_random_bytes(32), 'hex');

  -- Atualiza o token na tabela de autenticação
  update public.auth_users
  set reset_token = v_reset_token
  where user_id = v_user_id;

  return v_reset_token;
end;
$$;

-- Função para verificar credenciais com search_path explícito
create or replace function public.verify_credentials(
  p_email text,
  p_password text
)
returns table (
  user_id uuid,
  name text,
  email text,
  role text,
  is_approved boolean
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select u.id, u.name, u.email, u.role, u.is_approved
  from public.users u
  join public.auth_users au on au.user_id = u.id
  where u.email = p_email
    and au.password = p_password;
end;
$$;

-- Função para buscar usuários pendentes com search_path explícito
create or replace function public.get_pending_users()
returns table (
  id uuid,
  name text,
  email text,
  role text,
  is_approved boolean,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select u.id, u.name, u.email, u.role, u.is_approved, u.created_at
  from public.users u
  where not u.is_approved;
end;
$$;

-- Função para buscar todos os usuários com search_path explícito
create or replace function public.get_all_users()
returns table (
  id uuid,
  name text,
  email text,
  role text,
  is_approved boolean,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select u.id, u.name, u.email, u.role, u.is_approved, u.created_at
  from public.users u;
end;
$$;

-- Criar usuário admin inicial
do $$
declare
  v_user_id uuid;
begin
  -- Insere na tabela de usuários
  insert into public.users (name, email, role, is_approved)
  values ('David Elias', 'davideliasmagalhaes@gmail.com', 'admin', true)
  returning id into v_user_id;

  -- Insere na tabela de autenticação
  insert into public.auth_users (email, password, user_id)
  values ('davideliasmagalhaes@gmail.com', 'admin123', v_user_id);

  -- Insere na tabela auth.users do Supabase
  insert into auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
  )
  values (
    v_user_id,
    'davideliasmagalhaes@gmail.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"name": "David Elias"}'::jsonb
  );
end;
$$; 