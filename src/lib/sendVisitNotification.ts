import { supabase } from "@/integrations/supabase/client";

interface VisitNotificationParams {
  propertyId: string;
  propertyTitle: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  preferredDate: string | null;
  preferredTime: string | null;
  message: string | null;
  visitRequestId: string;
}

/**
 * Sends a visit request notification email to the agency via EmailJS.
 * Always fire-and-forget — never throws, never blocks the UI.
 */
export async function sendVisitNotification(params: VisitNotificationParams): Promise<void> {
  const serviceId  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_VISIT_TEMPLATE_ID;
  const publicKey  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    return;
  }

  try {
    // 1. Get agency_id + location from the property
    const { data: property, error: propError } = await supabase
      .from("properties")
      .select("agency_id, location")
      .eq("id", params.propertyId)
      .single();

    if (propError || !property?.agency_id) {
      return;
    }

    // 2. Get agency email + name
    const { data: agency, error: agencyError } = await supabase
      .from("agencies")
      .select("email, name")
      .eq("id", property.agency_id)
      .single();

    if (agencyError || !agency?.email) {
      return;
    }

    const dateTime = params.preferredDate
      ? `${params.preferredDate}${params.preferredTime ? ` at ${params.preferredTime}` : ""}`
      : "Not specified";

    // 3. Send via EmailJS REST API (same pattern as BookingForm)
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id:  serviceId,
        template_id: templateId,
        user_id:     publicKey,
        template_params: {
          to_email:          agency.email,
          agency_name:       agency.name,
          property_title:    params.propertyTitle,
          property_location: property.location ?? "",
          visitor_name:      params.visitorName,
          visitor_email:     params.visitorEmail,
          visitor_phone:     params.visitorPhone,
          preferred_date:    dateTime,
          message:           params.message || "No additional message.",
          dashboard_url:     `${window.location.origin}/agency/visits`,
          // status fields — not used in agency notification but kept for template compatibility
          status_title:      "🔔 New Visit Request",
          status_message:    `${params.visitorName} wants to visit this property on ${dateTime}.`,
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      // Silently log — never surface email errors to the user
      void text;
    }
  } catch {
    // Fire-and-forget — swallow all errors silently
  }
}
