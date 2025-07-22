-- Update the password for the specific user
-- This will update the password in the auth.users table
UPDATE auth.users 
SET 
  encrypted_password = crypt('123Pelada4', gen_salt('bf')),
  updated_at = now()
WHERE email = 'davideliasmagalhaes@gmail.com';