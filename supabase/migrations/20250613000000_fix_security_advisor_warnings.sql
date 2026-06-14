-- Fix Supabase Security Advisor warnings
-- Run in: Supabase Dashboard → SQL Editor (or via `supabase db push`)

-- ---------------------------------------------------------------------------
-- 1. pg_net in public schema
--    pg_net does NOT support: ALTER EXTENSION pg_net SET SCHEMA extensions;
--    Fix from Supabase Dashboard instead:
--    Database → Extensions → pg_net → Disable → Enable
--    (re-enables it in the extensions schema; net.http_post() keeps working)
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- 2. Revoke anon access to SECURITY DEFINER RPC functions
--    (app calls these with an authenticated Bearer token)
-- ---------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.accept_invitation(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_invitation(text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.invite_member(text, uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.invite_member(text, uuid, text, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_tasks() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_tasks() TO authenticated;

-- ---------------------------------------------------------------------------
-- 3. Revoke API access to internal trigger / event functions
--    (triggers invoke these directly; RPC access is not needed)
-- ---------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.add_project_owner() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_project_invitation_on_member_join() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_project_epic_id() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
