"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { inviteMember } from "@/lib/actions/products/members/invite-member";
import { queryKeys } from "@/lib/state/query-keys";

interface InviteMemberDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function emailIsValid(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function InviteMemberDialog({ projectId, open, onOpenChange }: InviteMemberDialogProps) {
  const [email, setEmail] = useState("");
  const queryClient = useQueryClient();

  const inviteMutation = useMutation({
    mutationFn: async (payload: { email: string; projectId: string; appUrl: string }) => {
      const result = await inviteMember(payload);
      if ("error" in result && result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: async (result) => {
      if (!("success" in result)) return;
      toast.success(result.message || "Invitation sent successfully");
      setEmail("");
      onOpenChange(false);
      await queryClient.invalidateQueries({
        queryKey: [...queryKeys.projects.root, "members", projectId],
      });
      await queryClient.invalidateQueries({
        queryKey: [...queryKeys.projects.root, "invitations", projectId],
      });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to send invitation");
    },
  });

  const isBusy = inviteMutation.isPending;

  const handleSubmit = () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      toast.error("Email is required");
      return;
    }
    if (!emailIsValid(normalizedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    inviteMutation.mutate({
      email: normalizedEmail,
      projectId,
      appUrl: window.location.origin,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="w-full max-w-[520px] rounded-lg p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Invite Team Member</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 p-6">
          <div className="inline-flex size-10 items-center justify-center rounded-md bg-[#E8EEF8] text-[#003380]">
            <UserPlus className="size-5" />
          </div>
          <div>
            <h2 className="text-3xl font-bold leading-tight text-[#11284d]">Invite Team Member</h2>
            <p className="mt-1 text-sm text-slate-500">Send an invitation to join this project workspace.</p>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold tracking-[0.08em] text-slate-500 uppercase">Email Address</label>
            <div className="relative">
              <Input
                type="text"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleSubmit();
                  }
                }}
                disabled={isBusy}
                placeholder="Enter email address"
                className="h-10 max-w-none rounded-md border border-slate-200 bg-[#E8EEF8] pr-10 text-sm text-slate-700"
              />
              <Mail className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="default"
              className="h-10 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              onClick={() => onOpenChange(false)}
              disabled={isBusy}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="brand"
              size="default"
              className="h-10 rounded-md bg-[#003380]! px-5 text-sm font-semibold text-white hover:bg-[#002d6e]! hover:opacity-100!"
              onClick={handleSubmit}
              disabled={isBusy}
            >
              {isBusy ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
