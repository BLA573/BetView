/**
 * Sends a single status update email to the visitor (buyer) when the agency
 * accepts, rejects, or reschedules their visit request.
 * Uses one shared EmailJS template with a dynamic status_message variable.
 * Always fire-and-forget — never throws, never blocks the UI.
 */

export type VisitStatusParams =
  | { status: "confirmed";   visitorEmail: string; visitorName: string; propertyTitle: string; agencyName: string; confirmedDate: string }
  | { status: "rejected";    visitorEmail: string; visitorName: string; propertyTitle: string; agencyName: string; rejectReason: string }
  | { status: "rescheduled"; visitorEmail: string; visitorName: string; propertyTitle: string; agencyName: string; proposedDate: string };

export async function sendVisitStatusNotification(params: VisitStatusParams): Promise<void> {
  const serviceId  = import.meta.env.VITE_EMAILJS_SERVICE_ID                  as string;
  const templateId = import.meta.env.VITE_EMAILJS_VISIT_STATUS_TEMPLATE_ID    as string;
  const publicKey  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY                  as string;

  if (!serviceId || !templateId || !publicKey) return;

  let status_title: string;
  let status_message: string;

  if (params.status === "confirmed") {
    status_title   = "✅ Your Visit is Confirmed!";
    status_message = `Great news! ${params.agencyName} has confirmed your visit for "${params.propertyTitle}".\n\nConfirmed date & time: ${params.confirmedDate}\n\nPlease arrive on time and bring a valid ID.`;
  } else if (params.status === "rejected") {
    status_title   = "Visit Request Update";
    status_message = `Unfortunately, ${params.agencyName} was unable to accommodate your visit request for "${params.propertyTitle}".\n\nReason: ${params.rejectReason}\n\nDon't be discouraged — there are many other great properties available on BetView.`;
  } else {
    status_title   = "📅 New Visit Time Proposed";
    status_message = `${params.agencyName} cannot accommodate your original time for "${params.propertyTitle}", but has proposed a new time.\n\nProposed date & time: ${params.proposedDate}\n\nIf this works for you, no action is needed. Otherwise, contact the agency directly.`;
  }

  try {
    await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id:  serviceId,
        template_id: templateId,
        user_id:     publicKey,
        template_params: {
          to_email:       params.visitorEmail,
          visitor_name:   params.visitorName,
          property_title: params.propertyTitle,
          agency_name:    params.agencyName,
          status_title,
          status_message,
          dashboard_url:  `${window.location.origin}/browse`,
        },
      }),
    });
  } catch {
    // Fire-and-forget — swallow silently
  }
}
