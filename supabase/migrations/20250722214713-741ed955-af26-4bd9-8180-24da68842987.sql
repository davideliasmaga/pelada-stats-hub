-- Fix the remaining function search path security issue
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, name, role, email)
  VALUES (
    new.id, 
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 
    coalesce(new.raw_user_meta_data->>'role', 'viewer'),
    new.email
  );
  RETURN new;
END;
$function$;