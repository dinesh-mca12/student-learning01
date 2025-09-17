/*
# [Fix] Correct User Profile Creation Trigger
[This migration script provides a definitive fix for the user profile creation process. It replaces the existing trigger and function with a secure and robust version that correctly handles permissions and schema context, resolving the "Database error saving new user" issue.]

## Query Description: [This operation will safely update the automated user profile creation mechanism. It first removes the old trigger and function, then creates a new, secure function that explicitly defines its execution context to prevent schema-related errors. Finally, it re-establishes the trigger. There is no risk to existing user data.]

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true]

## Structure Details:
- Drops trigger: on_auth_user_created on auth.users
- Drops function: public.handle_new_user()
- Creates function: public.handle_new_user()
- Creates trigger: on_auth_user_created on auth.users

## Security Implications:
- RLS Status: [Unaffected]
- Policy Changes: [No]
- Auth Requirements: [None]
- Note: This fixes a security warning by properly defining the function's search path and using SECURITY DEFINER.

## Performance Impact:
- Indexes: [None]
- Triggers: [Replaced]
- Estimated Impact: [Negligible. This is a standard and lightweight trigger for user creation.]
*/

-- Step 1: Drop the existing trigger on the auth.users table.
-- This is necessary to remove the dependency on the old function.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Drop the old, problematic function.
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 3: Create the new, corrected function.
-- This version uses 'SECURITY DEFINER' to run with the permissions of the user who defined it (the owner),
-- allowing it to insert into the public.profiles table.
-- It also explicitly sets the 'search_path' to 'public', which resolves the security warning and ensures
-- the function can always find the 'profiles' table.
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
    new.raw_user_meta_data->>'role',
    new.email
  );
  RETURN new;
END;
$$;

-- Step 4: Re-create the trigger to call the new, corrected function.
-- This trigger will now fire after a new user is created in the auth.users table
-- and successfully execute the handle_new_user function.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();
