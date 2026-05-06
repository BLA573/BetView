import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const APP_URL = Deno.env.get("APP_URL") ?? "https://bet-view.vercel.app";

// Sandbox: Resend only allows sending to your own verified email
// when no domain is verified. Swap FROM_EMAIL once domain is verified.
const FROM_EMAIL = "onboarding@resend.dev";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VisitPayload {
  agencyEmail: string;
  agencyName: string;
  propertyTitle: string;
  propertyLocation: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  preferredDate: string | null;
  preferredTime: string | null;
  message: string | null;
  visitRequestId: string;
}

function buildEmailHtml(p: VisitPayload): string {
  const dateTime = p.preferredDate
    ? `${p.preferredDate}${p.preferredTime ? ` at ${p.preferredTime}` : ""}`
    : "Not specified";

  const dashboardUrl = `${APP_URL}/agency/visits`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Visit Request – BetView</title>
</head>
<body style="margin:0;padding:0;background:#0f1e3a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1e3a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:28px;text-align:center;">
              <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                Bet<span style="color:#3b82f6;">View</span>
                <span style="font-weight:300;color:#93c5fd;font-size:18px;"> ቤት View</span>
              </span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#162444;border-radius:16px;border:1px solid #1e3a6e;overflow:hidden;">

              <!-- Top accent bar -->
              <tr>
                <td style="background:linear-gradient(90deg,#2563eb,#3b82f6);height:4px;"></td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:36px 40px;">

                  <!-- Bell icon + title -->
                  <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">
                    New Visit Request
                  </p>
                  <h1 style="margin:0 0 24px;font-size:24px;font-weight:700;color:#ffffff;line-height:1.3;">
                    Someone wants to visit<br/>
                    <span style="color:#3b82f6;">${p.propertyTitle}</span>
                  </h1>

                  <!-- Property row -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                    <tr>
                      <td style="background:#1a2d52;border-radius:10px;padding:16px 20px;">
                        <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.8px;">Property</p>
                        <p style="margin:0;font-size:16px;font-weight:600;color:#ffffff;">${p.propertyTitle}</p>
                        <p style="margin:4px 0 0;font-size:13px;color:#94a3b8;">${p.propertyLocation}</p>
                      </td>
                    </tr>
                  </table>

                  <!-- Visitor details grid -->
                  <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;">Visitor Details</p>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                    <tr>
                      <td width="50%" style="padding-right:8px;padding-bottom:10px;">
                        <div style="background:#1a2d52;border-radius:8px;padding:12px 16px;">
                          <p style="margin:0 0 3px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.6px;">Name</p>
                          <p style="margin:0;font-size:14px;font-weight:600;color:#ffffff;">${p.visitorName}</p>
                        </div>
                      </td>
                      <td width="50%" style="padding-left:8px;padding-bottom:10px;">
                        <div style="background:#1a2d52;border-radius:8px;padding:12px 16px;">
                          <p style="margin:0 0 3px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.6px;">Phone</p>
                          <p style="margin:0;font-size:14px;font-weight:600;color:#ffffff;">${p.visitorPhone}</p>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td width="50%" style="padding-right:8px;padding-bottom:10px;">
                        <div style="background:#1a2d52;border-radius:8px;padding:12px 16px;">
                          <p style="margin:0 0 3px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.6px;">Email</p>
                          <p style="margin:0;font-size:14px;font-weight:600;color:#3b82f6;">${p.visitorEmail}</p>
                        </div>
                      </td>
                      <td width="50%" style="padding-left:8px;padding-bottom:10px;">
                        <div style="background:#1a2d52;border-radius:8px;padding:12px 16px;">
                          <p style="margin:0 0 3px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.6px;">Requested Time</p>
                          <p style="margin:0;font-size:14px;font-weight:600;color:#ffffff;">${dateTime}</p>
                        </div>
                      </td>
                    </tr>
                  </table>

                  <!-- Message -->
                  ${p.message ? `
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                    <tr>
                      <td style="background:#1a2d52;border-left:3px solid #3b82f6;border-radius:0 8px 8px 0;padding:14px 18px;">
                        <p style="margin:0 0 4px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.6px;">Message from visitor</p>
                        <p style="margin:0;font-size:14px;color:#cbd5e1;line-height:1.6;">${p.message}</p>
                      </td>
                    </tr>
                  </table>` : ""}

                  <!-- CTA -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <a href="${dashboardUrl}"
                           style="display:inline-block;background:linear-gradient(135deg,#2563eb,#3b82f6);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:10px;letter-spacing:0.3px;">
                          View &amp; Respond in Dashboard →
                        </a>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:20px 40px;border-top:1px solid #1e3a6e;">
                  <p style="margin:0;font-size:12px;color:#475569;text-align:center;">
                    This notification was sent to <strong style="color:#64748b;">${p.agencyName}</strong> via BetView.<br/>
                    Log in to <a href="${dashboardUrl}" style="color:#3b82f6;text-decoration:none;">your dashboard</a> to accept, reject, or reschedule.
                  </p>
                </td>
              </tr>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set in Edge Function secrets.");
    }

    const payload: VisitPayload = await req.json();

    // Validate required fields
    const required: (keyof VisitPayload)[] = [
      "agencyEmail", "agencyName", "propertyTitle", "propertyLocation",
      "visitorName", "visitorEmail", "visitorPhone", "visitRequestId",
    ];
    for (const field of required) {
      if (!payload[field]) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    const html = buildEmailHtml(payload);

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        // In sandbox mode Resend only delivers to your own verified email.
        // Replace with payload.agencyEmail once domain is verified.
        to: [payload.agencyEmail],
        subject: `🔔 New Visit Request: ${payload.propertyTitle}`,
        html,
      }),
    });

    const resendBody = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend error:", resendBody);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: resendBody }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log("Email sent successfully:", resendBody.id);
    return new Response(
      JSON.stringify({ success: true, emailId: resendBody.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );

  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
