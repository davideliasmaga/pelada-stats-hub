-- Update the trigger function to check for approved account requests
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Check if there's an approved account request for this email
  DECLARE
    approved_request record;
  BEGIN
    SELECT * INTO approved_request 
    FROM public.account_requests 
    WHERE email = new.email 
    AND status = 'approved' 
    LIMIT 1;
    
    -- If there's an approved request, use that role
    IF FOUND THEN
      INSERT INTO public.profiles (id, name, role, email)
      VALUES (
        new.id, 
        coalesce(new.raw_user_meta_data->>'name', approved_request.name, split_part(new.email, '@', 1)), 
        approved_request.role,
        new.email
      );
    ELSE
      -- Default behavior for users without approved requests (like Google OAuth)
      INSERT INTO public.profiles (id, name, role, email)
      VALUES (
        new.id, 
        coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 
        coalesce(new.raw_user_meta_data->>'role', 'viewer'),
        new.email
      );
    END IF;
  END;
  
  RETURN new;
END;
$function$;