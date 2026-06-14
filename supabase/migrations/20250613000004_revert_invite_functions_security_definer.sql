-- Revert invite/accept functions to SECURITY DEFINER
-- INVOKER broke invite flow: "permission denied for table users"
-- anon access is already revoked; only authenticated users can call these RPCs.

ALTER FUNCTION public.invite_member(text, uuid, text, text) SECURITY DEFINER;
ALTER FUNCTION public.accept_invitation(text) SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION public.invite_member(text, uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.invite_member(text, uuid, text, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.accept_invitation(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_invitation(text) TO authenticated;
