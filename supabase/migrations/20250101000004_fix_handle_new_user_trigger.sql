/*
          # [Operation Name]
          Fix User Profile Creation Trigger

          ## Query Description: [This script resolves a database migration conflict by safely updating the function that creates user profiles. It first removes the existing trigger, updates the function to include necessary security permissions, and then reinstates the trigger. This ensures that new user sign-ups are processed correctly without database errors.]
          
          ## Metadata:
          - Schema-Category: ["Structural"]
          - Impact-Level: ["Medium"]
          - Requires-Backup: [false]
          - Reversible: [true]
          
          ## Structure Details:
          - Drops and recreates the `on_auth_user_created` trigger on `auth.users`.
          - Drops and recreates the `public.handle_new_user` function.
          
          ## Security Implications:
          - RLS Status: [Unaffected]
          - Policy Changes: [No]
          - Auth Requirements: [None]
          
          ## Performance Impact:
          - Indexes: [None]
          - Triggers: [Modified]
          - Estimated Impact: [Low. This is a one-time structural change that improves the reliability of the sign-up process.]
          */

-- Step 1: Drop the dependent trigger first to resolve the dependency conflict.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Now that the trigger is removed, we can safely drop the old function.
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 3: Recreate the function with the correct SECURITY DEFINER and search_path settings.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, email)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    (new.raw_user_meta_data->>'role')::public.user_role,
    new.email
  );
  RETURN new;
END;
$$;

-- Step 4: Recreate the trigger to execute the new, corrected function.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
