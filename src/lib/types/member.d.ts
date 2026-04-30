export type ProjectMember = {
    id: string;
    userId: string | null;
    name: string;
    email: string;
    role: "Owner" | "Admin" | "Member" | "Viewer";
    avatarUrl: string | null;
  };

export type ProjectInvitation = {
    id: string;
    email: string;
    createdAt: string | null;
    expiresAt: string | null;
  };