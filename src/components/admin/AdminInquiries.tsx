import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, Phone, MessageSquare } from "lucide-react";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string;
  properties: { title: string } | null;
}

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("inquiries")
        .select("id, name, email, phone, message, created_at, properties(title)")
        .order("created_at", { ascending: false });
      setInquiries((data as Inquiry[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (inquiries.length === 0) {
    return <p className="text-center text-muted-foreground py-16">No inquiries yet.</p>;
  }

  return (
    <div className="space-y-3">
      {inquiries.map((inq) => (
        <div key={inq.id} className="p-4 rounded-xl border border-border bg-card shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-display font-semibold text-foreground">{inq.name}</p>
            <span className="text-xs text-muted-foreground">
              {new Date(inq.created_at).toLocaleDateString()}
            </span>
          </div>
          {inq.properties && (
            <p className="text-xs text-accent font-medium">Re: {inq.properties.title}</p>
          )}
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {inq.email}</span>
            {inq.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {inq.phone}</span>}
          </div>
          <div className="flex items-start gap-1.5 text-sm text-foreground">
            <MessageSquare className="w-3.5 h-3.5 mt-0.5 text-muted-foreground flex-shrink-0" />
            <p>{inq.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminInquiries;
