-- First, drop the old trigger and function if they exist to avoid conflicts.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

/*
# [Fix] Recreate New User Profile Trigger
This migration fixes a critical bug where new user accounts could not be created due to a database error. The previous trigger was misconfigured, preventing it from successfully creating a user profile record after a new user signed up.

## Query Description:
This script replaces the faulty database trigger with a corrected version.
1.  It defines a function (`handle_new_user`) that automatically creates a profile in the `public.profiles` table when a new user is added to `auth.users`.
2.  It sets the function to run with `SECURITY DEFINER` privileges, which is the key fix. This allows the function to bypass Row Level Security policies on the `profiles` table just for the initial insertion, ensuring the profile is always created.
3.  It creates a trigger that fires this function after every new user signs up.

This change is safe and essential for the sign-up functionality to work correctly. It does not affect existing user data.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "High"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- **Tables Affected:** `auth.users` (trigger), `public.profiles` (insertion)
- **Objects Created:** `FUNCTION public.handle_new_user`, `TRIGGER on_auth_user_created`

## Security Implications:
- RLS Status: The `SECURITY DEFINER` setting allows this specific function to bypass RLS for the `INSERT` operation on `public.profiles`. This is a standard and secure pattern for this use case. RLS policies will still apply to all other operations (SELECT, UPDATE, DELETE) for regular users.
- Policy Changes: No
- Auth Requirements: This function is triggered by the Supabase authentication system.

## Performance Impact:
- Indexes: None
- Triggers: Adds a trigger to `auth.users`. The impact is negligible.
- Estimated Impact: Low
*/

-- Create the function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'role'
  );
  return new;
end;
$$;

-- Create the trigger to execute the function after a new user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
