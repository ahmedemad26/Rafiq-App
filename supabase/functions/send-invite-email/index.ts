declare const Deno: {
  serve(handler: (req: Request) => Response | Promise<Response>): void;
  env: {
    get(name: string): string | undefined;
  };
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type InviteEmailPayload = {
  email?: string;
  invite_link?: string;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as InviteEmailPayload;
    const email = body.email?.trim().toLowerCase();
    const inviteLink = body.invite_link?.trim();

    if (!email || !inviteLink) {
      console.error("send-invite-email: missing email or invite_link", body);
      return new Response(
        JSON.stringify({ error: "email and invite_link are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("INVITE_FROM_EMAIL") ?? "Taskly <onboarding@resend.dev>";

    if (!resendApiKey) {
      console.error("send-invite-email: RESEND_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Email service is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log("send-invite-email: sending", { email, inviteLink, fromEmail });

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject: "You are invited to join a Taskly project",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #11284d;">
            <h2>Project invitation</h2>
            <p>You were invited to join a project workspace on Taskly.</p>
            <p>
              <a href="${inviteLink}" style="display:inline-block;padding:12px 18px;background:#003380;color:#ffffff;text-decoration:none;border-radius:6px;">
                Accept invitation
              </a>
            </p>
            <p>If the button does not work, copy and paste this link:</p>
            <p><a href="${inviteLink}">${inviteLink}</a></p>
          </div>
        `,
      }),
    });

    const resendBody = await resendRes.json().catch(() => ({}));
    console.log("send-invite-email: resend response", {
      status: resendRes.status,
      body: resendBody,
    });

    if (!resendRes.ok) {
      return new Response(JSON.stringify({ error: resendBody }), {
        status: resendRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, id: resendBody.id ?? null }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-invite-email: unexpected error", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
