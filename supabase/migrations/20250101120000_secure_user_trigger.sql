/*
# [Fix] Secure User Profile Creation Trigger
[This migration replaces the existing user profile creation trigger with a more secure version that explicitly sets the database search path. This resolves a security warning and prevents potential errors during new user sign-up.]

## Query Description: [This operation drops the old `handle_new_user` function and recreates it with a fixed `search_path`. This is a safe, non-destructive change that only affects the backend logic for new user creation. No existing user data will be altered.]

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true]

## Structure Details:
- Function Affected: `public.handle_new_user()`

## Security Implications:
- RLS Status: [Unaffected]
- Policy Changes: [No]
- Auth Requirements: [This fixes a function related to `auth.users` triggers.]
- Security Improvement: Resolves the "Function Search Path Mutable" warning for a `SECURITY DEFINER` function, preventing potential hijacking attacks.

## Performance Impact:
- Indexes: [Unaffected]
- Triggers: [Unaffected (trigger definition remains the same, only the underlying function is replaced)]
- Estimated Impact: [None. This is a logic fix with no performance overhead.]
*/

-- Drop the old function if it exists to ensure a clean replacement
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the new, secure function with a defined search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public -- This line is the critical fix
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, email)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    (new.raw_user_meta_data->>'role')::user_role,
    new.email
  );
  RETURN new;
END;
$$;

-- Re-create the trigger to ensure it's linked to the new function correctly.
-- This also prevents errors if the trigger was somehow dropped.
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
