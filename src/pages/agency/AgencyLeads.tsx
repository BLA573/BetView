import { useEffect, useState } from "react";
import AgencyLayout from "@/components/agency/AgencyLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Phone, MessageSquare, Crown, Loader2 } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  is_priority: boolean;
  created_at: string;
  properties: { title: string } | null;
}

const AgencyLeads = () => {
  const { agencyId } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!agencyId) return;
    supabase
      .from("inquiries")
      .select("id, name, email, phone, message, is_priority, created_at, properties!inner(title, agency_id)")
      .eq("properties.agency_id", agencyId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setLeads((data as unknown as Lead[]) || []);
        setLoading(false);
      });
  }, [agencyId]);

  return (
    <AgencyLayout>
      <div className="space-y-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground">My Leads</h1>
            <p className="text-muted-foreground text-sm mt-1">Inquiries from buyers interested in your properties</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : leads.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">No inquiries yet.</p>
          ) : (
            <div className="space-y-3">
              {leads.map((lead) => (
                <div key={lead.id} className="p-4 rounded-xl border border-border bg-card shadow-card space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="font-display font-semibold text-foreground">{lead.name}</p>
                      {lead.is_priority && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 text-xs font-semibold border border-yellow-500/20">
                          <Crown className="w-3 h-3" /> Priority
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {lead.properties && (
                    <p className="text-xs text-accent font-medium">Re: {lead.properties.title}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <a href={`mailto:${lead.email}`} className="flex items-center gap-1 hover:text-foreground transition-colors">
                      <Mail className="w-3.5 h-3.5" /> {lead.email}
                    </a>
                    {lead.phone && (
                      <a href={`tel:${lead.phone}`} className="flex items-center gap-1 hover:text-foreground transition-colors">
                        <Phone className="w-3.5 h-3.5" /> {lead.phone}
                      </a>
                    )}
                  </div>
                  <div className="flex items-start gap-1.5 text-sm text-foreground">
                    <MessageSquare className="w-3.5 h-3.5 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <p>{lead.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </AgencyLayout>
  );
};

export default AgencyLeads;
