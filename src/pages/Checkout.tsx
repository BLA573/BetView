import { useState, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, X, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ThemeToggle from "@/components/shared/ThemeToggle";


interface PlanInfo {
  name: string;
  price: string;
  period: string;
}

const ALLOWED_MIME = ["image/jpeg", "image/png", "application/pdf"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, agencyId } = useAuth();
  const { toast } = useToast();

  const plan = (location.state as { plan?: PlanInfo })?.plan;

  const [paymentMethod, setPaymentMethod] = useState<"cbe" | "telebirr">("cbe");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!plan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No plan selected.</p>
          <Link to="/pricing" className="text-primary hover:underline">View Pricing</Link>
        </div>
      </div>
    );
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ALLOWED_MIME.includes(f.type)) {
      toast({ title: "Invalid file type", description: "Please upload JPG, PNG, or PDF.", variant: "destructive" });
      return;
    }
    if (f.size > MAX_SIZE) {
      toast({ title: "File too large", description: "Max size is 5MB.", variant: "destructive" });
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !agencyId) {
      toast({ title: "Not authenticated", variant: "destructive" });
      return;
    }
    if (!file) {
      toast({ title: "Please upload payment proof", variant: "destructive" });
      return;
    }
    setSubmitting(true);

    // Upload proof to Supabase Storage
    const ext = file.name.split(".").pop();
    const filePath = `payment-proofs/${agencyId}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("payment-proofs").upload(filePath, file, { contentType: file.type });
    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    // Create plan_purchase_request record
    const { error: dbError } = await supabase.from("plan_purchase_requests").insert({
      agency_id: agencyId,
      user_id: user.id,
      plan_name: plan.name.toLowerCase(),
      payment_method: paymentMethod,
      proof_path: filePath,
      status: "pending_approval",
    });
    if (dbError) {
      toast({ title: "Submission failed", description: dbError.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-display font-bold text-2xl text-foreground">Request Submitted!</h1>
          <p className="text-muted-foreground">
            Your payment proof has been received. Our team will review it and activate your <strong className="text-foreground">{plan.name}</strong> plan within 1–2 business days. You'll receive a notification upon approval.
          </p>
          <Link to="/agency" className="inline-block px-8 py-3 rounded-xl gradient-blue text-white font-semibold shadow-blue hover:opacity-90 transition-all">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background page-transition">
      <nav className="flex items-center justify-between px-6 md:px-16 py-6 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center shadow-blue">
            <span className="text-primary-foreground font-display font-bold text-sm">B</span>
          </div>
          <span className="font-display font-semibold text-xl text-foreground tracking-tight">BetView</span>

        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>

      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-foreground">Checkout</h1>
          <p className="text-muted-foreground mt-2">Complete your payment to activate the <strong className="text-foreground">{plan.name}</strong> plan.</p>
        </div>

        {/* Plan Summary */}
        <div className="p-6 rounded-xl border border-primary bg-primary/5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-xl text-foreground">{plan.name} Plan</h2>
              <p className="text-muted-foreground text-sm">Monthly subscription</p>
            </div>
            <div className="text-right">
              <p className="font-display font-bold text-2xl text-foreground">{plan.price} ETB</p>
              <p className="text-xs text-muted-foreground">{plan.period}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Payment Method */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-foreground text-lg">Payment Method</h3>
            <div className="grid grid-cols-2 gap-4">
              {(["cbe", "telebirr"] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${paymentMethod === method ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"}`}
                >
                  <p className="font-semibold text-foreground">{method === "cbe" ? "CBE Bank Transfer" : "Telebirr"}</p>
                  <p className="text-xs text-muted-foreground mt-1">{method === "cbe" ? "Commercial Bank of Ethiopia" : "Ethio Telecom Mobile Money"}</p>
                </button>
              ))}
            </div>

            {/* Payment Instructions */}
            <div className="p-6 rounded-xl bg-secondary space-y-3">
              <h4 className="font-semibold text-foreground">Payment Instructions</h4>
              {paymentMethod === "cbe" ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Bank</span>
                    <span className="font-medium text-foreground">Commercial Bank of Ethiopia</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Account Number</span>
                    <span className="font-medium text-foreground font-mono">1000123456789</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Account Name</span>
                    <span className="font-medium text-foreground">BetView Technologies PLC</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-bold text-primary">{plan.price} ETB</span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-2">Please include your agency name in the transfer reference/memo field.</p>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Telebirr Number</span>
                    <span className="font-medium text-foreground font-mono">+251 912 345 678</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Registered Name</span>
                    <span className="font-medium text-foreground">BetView Technologies</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-bold text-primary">{plan.price} ETB</span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-2">Send the exact amount and take a screenshot of the confirmation.</p>
                </div>
              )}
            </div>
          </div>

          {/* Upload Proof */}
          <div className="space-y-4">
            <div>
              <h3 className="font-display font-semibold text-foreground text-lg">Upload Payment Proof</h3>
              <p className="text-muted-foreground text-sm mt-1">Screenshot, receipt, or transaction confirmation. JPG, PNG, or PDF. Max 5MB.</p>
            </div>
            <div
              onClick={() => fileRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all text-center hover:border-primary/60 ${file ? "border-primary bg-primary/5" : "border-border"}`}
            >
              <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={handleFile} />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">{file.name}</span>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-muted-foreground hover:text-destructive">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-foreground font-medium">Click to upload payment proof</p>
                  <p className="text-muted-foreground text-sm mt-1">or drag and drop</p>
                </>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !file}
            className="w-full py-4 rounded-xl gradient-blue text-white font-bold text-base shadow-blue hover:opacity-90 transition-all disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit for Approval"}
          </button>
          <p className="text-center text-xs text-muted-foreground">Your plan will be activated once our team reviews and approves your payment.</p>
        </form>
      </div>
    </main>
  );
};

export default Checkout;
