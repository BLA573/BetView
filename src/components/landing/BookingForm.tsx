import { useState } from "react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  agencyName: z.string().trim().min(1, "Agency name is required").max(100),
  contactPerson: z.string().trim().min(1, "Contact person is required").max(100),
  phone: z
    .string()
    .trim()
    .min(7, "Valid phone number required")
    .max(20)
    .regex(/^[+]?[-\d\s()]{7,20}$/, "Phone number format is invalid"),
  email: z.string().trim().email("Valid email required").max(255),
  listings: z.string().min(1, "Please select an option"),
});

type FormData = z.infer<typeof schema>;
type Errors = Partial<Record<keyof FormData, string>>;

const EMAIL_RECIPIENT = "hailemichaelsolomon176@gmail.com";

const BookingForm = () => {
  const { toast } = useToast();
  const [form, setForm] = useState<FormData>({
    agencyName: "",
    contactPerson: "",
    phone: "",
    email: "",
    listings: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendBookingEmail = async (payload: FormData) => {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      throw new Error("Email service is not configured. Missing EmailJS environment variables.");
    }

    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          to_email: EMAIL_RECIPIENT,
          name: payload.contactPerson,
          email: payload.email,
          phone: payload.phone,
          agency_name: payload.agencyName,
          active_listings: payload.listings,
          message: `Demo request from ${payload.contactPerson} (${payload.email}, ${payload.phone}) for agency "${payload.agencyName}" with ${payload.listings} listings.`,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to send email.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Errors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof FormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      await sendBookingEmail(result.data);

      toast({
        title: "Request submitted",
        description: "Your demo request has been sent successfully.",
      });

      setSubmitted(true);
    } catch (error) {
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Unable to send your request right now.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: keyof FormData) =>
    `w-full px-4 py-3 rounded-xl text-white placeholder:text-white/30 outline-none focus:ring-2 transition-all ${errors[field] ? "ring-2 ring-red-500" : "focus:ring-blue-electric"
    }`;

  const inputStyle = { background: 'hsl(215,55%,16%)', border: '1px solid hsl(215,40%,24%)' };

  return (
    <section id="booking-form" className="py-24" style={{ background: 'hsl(215,66%,10%)' }}>
      <div className="container max-w-2xl">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase mb-4"
            style={{ background: 'hsl(214,80%,40%,0.15)', color: 'hsl(var(--blue-glow))' }}>
            Free Demo
          </span>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
            Book Your Free Agency Demo
          </h2>
          <p style={{ color: 'hsl(215,30%,60%)' }}>
            Our team will contact you within 24 hours to arrange a personalized VR platform walkthrough.
          </p>
        </div>

        <div className="rounded-2xl p-8 md:p-10" style={{ background: 'hsl(215,55%,13%)', border: '1px solid hsl(215,40%,20%)' }}>
          {submitted ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full gradient-blue flex items-center justify-center mx-auto mb-6 shadow-blue">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-2xl text-white mb-3">Request Received!</h3>
              <p style={{ color: 'hsl(215,30%,65%)' }}>
                Thank you. Our team will contact you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Agency Name *</label>
                  <input
                    name="agencyName"
                    value={form.agencyName}
                    onChange={handleChange}
                    placeholder="e.g. Addis Homes Agency"
                    className={inputClass("agencyName")}
                    style={inputStyle}
                  />
                  {errors.agencyName && <p className="text-red-400 text-xs mt-1">{errors.agencyName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Contact Person *</label>
                  <input
                    name="contactPerson"
                    value={form.contactPerson}
                    onChange={handleChange}
                    placeholder="Full name"
                    className={inputClass("contactPerson")}
                    style={inputStyle}
                  />
                  {errors.contactPerson && <p className="text-red-400 text-xs mt-1">{errors.contactPerson}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Phone Number *</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+251 9xx xxx xxxx"
                    className={inputClass("phone")}
                    style={inputStyle}
                  />
                  {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Email Address *</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@agency.com"
                    className={inputClass("email")}
                    style={inputStyle}
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Number of Active Listings *</label>
                <select
                  name="listings"
                  value={form.listings}
                  onChange={handleChange}
                  className={inputClass("listings")}
                  style={{ ...inputStyle, appearance: 'none' }}
                >
                  <option value="" disabled>Select range</option>
                  <option value="1-10">1 – 10 listings</option>
                  <option value="11-30">11 – 30 listings</option>
                  <option value="31-100">31 – 100 listings</option>
                  <option value="100+">100+ listings</option>
                </select>
                {errors.listings && <p className="text-red-400 text-xs mt-1">{errors.listings}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl gradient-blue text-white font-semibold shadow-blue hover:opacity-90 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Request Free Demo →"
                )}
              </button>

              <p className="text-center text-xs" style={{ color: 'hsl(215,30%,50%)' }}>
                No commitment required. We'll reach out within 24 hours.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default BookingForm;
