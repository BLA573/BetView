import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  propertyId: string;
  propertyTitle: string;
  open: boolean;
  onClose: () => void;
}

const ContactAgentModal = ({ propertyId, propertyTitle, open, onClose }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(`Hi, I'm interested in "${propertyTitle}". Please contact me with more details.`);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please sign in first", description: "You need an account to contact agents.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("inquiries").insert({
      user_id: user.id,
      property_id: propertyId,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      message: message.trim(),
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Inquiry sent!", description: "An agent will reach out to you shortly." });
      onClose();
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Contact Agent</DialogTitle>
        </DialogHeader>
        {!user ? (
          <p className="text-muted-foreground text-sm py-4">
            Please <a href="/auth" className="text-primary font-medium hover:underline">sign in</a> to contact an agent.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Phone (optional)</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} required />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl gradient-blue text-primary-foreground font-semibold shadow-blue hover:opacity-90 transition-all disabled:opacity-50"
            >
              {submitting ? "Sending…" : "Send Inquiry"}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ContactAgentModal;
