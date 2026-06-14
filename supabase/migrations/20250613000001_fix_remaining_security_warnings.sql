-- Remaining Security Advisor warnings (lint 0029 + unused RPC)
-- Run in: Supabase Dashboard → SQL Editor

-- ---------------------------------------------------------------------------
-- 1. get_tasks() is not used by the app — revoke all API access
-- ---------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.get_tasks() FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. accept_invitation + invite_member
--    NOTE: SECURITY INVOKER breaks invite flow (permission denied for table users).
--    Keep as SECURITY DEFINER — see 20250613000004_revert_invite_functions_security_definer.sql
-- ---------------------------------------------------------------------------
-- ALTER FUNCTION public.accept_invitation(text) SECURITY INVOKER;
-- ALTER FUNCTION public.invite_member(text, uuid, text, text) SECURITY INVOKER;
