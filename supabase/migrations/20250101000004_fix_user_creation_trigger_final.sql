/*
          # [Fix] Correct User Profile Creation Trigger
          [This script replaces the user creation function and trigger to resolve a permissions issue that prevents new user profiles from being saved. It addresses the 'Function Search Path Mutable' security warning by explicitly setting the search path.]

          ## Query Description: [This operation safely updates the automated user profile creation process. It first removes the old trigger and function, then creates a new, more secure version. This ensures that every new user who signs up will have a corresponding profile entry created automatically and reliably. There is no risk to existing data.]
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Drops trigger: on_auth_user_created on auth.users
          - Drops function: public.handle_new_user()
          - Creates function: public.handle_new_user() with `SECURITY DEFINER` and `SET search_path = 'public'`.
          - Creates trigger: on_auth_user_created on auth.users
          
          ## Security Implications:
          - RLS Status: Unchanged
          - Policy Changes: No
          - Auth Requirements: This function runs with the permissions of the function creator, which is necessary to insert into the `public.profiles` table. The `search_path` is restricted to 'public' to prevent security issues.
          
          ## Performance Impact:
          - Indexes: None
          - Triggers: Replaced
          - Estimated Impact: Negligible. This operation only affects the sign-up process.
          */

-- 1. Drop the existing trigger and function to allow for replacement.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;

-- 2. Create the new function with explicit security settings.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    (new.raw_user_meta_data ->> 'role')::public.user_role
  );
  RETURN new;
END;
$$;

-- 3. Re-create the trigger to use the new, secure function.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Grant execute permissions on the function to the 'postgres' and 'anon' roles.
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;
