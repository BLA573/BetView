import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarCheck } from "lucide-react";

interface Props {
  propertyId: string;
  propertyTitle: string;
  open: boolean;
  onClose: () => void;
}

const BookVisitModal = ({ propertyId, propertyTitle, open, onClose }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: user?.email || "",
    preferredDate: "",
    preferredTime: "",
    message: "",
    consent: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please sign in first", variant: "destructive" });
      return;
    }
    if (!form.consent) {
      toast({ title: "Please consent to contact", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("visit_requests").insert({
      user_id: user.id,
      property_id: propertyId,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      preferred_date: form.preferredDate || null,
      preferred_time: form.preferredTime || null,
      message: form.message.trim() || null,
      status: "pending",
    });
    if (error) {
      toast({ title: "Error submitting request", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Visit request submitted!", description: "The agency will contact you to confirm." });
      onClose();
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-primary" /> Book a Visit
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">"{propertyTitle}"</p>
        </DialogHeader>
        {!user ? (
          <p className="text-muted-foreground text-sm py-4">
            Please <a href="/auth" className="text-primary font-medium hover:underline">sign in</a> to book a visit.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Preferred Date</Label>
                <Input type="date" value={form.preferredDate} onChange={(e) => set("preferredDate", e.target.value)} min={new Date().toISOString().split("T")[0]} />
              </div>
              <div className="space-y-2">
                <Label>Preferred Time</Label>
                <Input type="time" value={form.preferredTime} onChange={(e) => set("preferredTime", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes / Message</Label>
              <Textarea value={form.message} onChange={(e) => set("message", e.target.value)} rows={3} placeholder="Any specific questions or requirements?" />
            </div>
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={form.consent} onChange={(e) => set("consent", e.target.checked)} className="mt-1" />
              <span className="text-sm text-muted-foreground">I consent to being contacted by the agency regarding this visit request. *</span>
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl gradient-blue text-primary-foreground font-semibold shadow-blue hover:opacity-90 transition-all disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit Visit Request"}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookVisitModal;
