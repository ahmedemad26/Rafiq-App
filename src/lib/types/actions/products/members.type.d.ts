export type InviteMemberResult =
  | { error: string; status?: number }
  | { success: true; message: string };

export type AcceptInvitationResult =
  | { error: string; status?: number }
  | { success: true; projectId: string | null; message: string };

export type UpdateMemberRoleResult =
  | { error: string; status?: number }
  | { success: true; message: string };
