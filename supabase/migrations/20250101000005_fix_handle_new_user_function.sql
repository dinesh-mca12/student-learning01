/*
          # [Fix] Correct User Profile Creation Trigger
          This migration replaces the user profile creation function and trigger with a secure and robust version that resolves the "Database error saving new user" issue.

          ## Query Description: 
          This operation safely replaces the database function responsible for creating a user profile after sign-up. It first removes the old trigger and function to avoid dependency errors, then creates a new version with the necessary security settings (`SECURITY DEFINER` and `search_path`). This ensures that new user profiles are created reliably without being blocked by permissions issues. This change is safe and does not affect existing user data.
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Drops trigger: `on_auth_user_created` on `auth.users`
          - Drops function: `public.handle_new_user()`
          - Creates function: `public.handle_new_user()` with `SECURITY DEFINER` and `search_path`
          - Creates trigger: `on_auth_user_created` on `auth.users`
          
          ## Security Implications:
          - RLS Status: Unchanged
          - Policy Changes: No
          - Auth Requirements: This function runs with the definer's privileges to insert into the `public.profiles` table, which is a standard and secure pattern for this use case.
          
          ## Performance Impact:
          - Indexes: None
          - Triggers: Replaces an existing trigger. No performance impact is expected.
          - Estimated Impact: Negligible.
          */

-- Step 1: Drop the existing trigger and function to avoid dependency errors.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 2: Create the new function with the required security settings.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Step 3: Re-create the trigger to use the new, corrected function.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();
