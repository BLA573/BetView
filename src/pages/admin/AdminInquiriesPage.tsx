import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Phone, MessageSquare } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  created_at: string;
  properties: { title: string } | null;
}

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  new: "default",
  in_progress: "secondary",
  handled: "outline",
};

const AdminInquiriesPage = () => {
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchInquiries = async () => {
    setLoading(true);
    let query = supabase
      .from("inquiries")
      .select("id, name, email, phone, message, status, created_at, properties(title)")
      .order("created_at", { ascending: false });

    if (filter !== "all") query = query.eq("status", filter);

    const { data } = await query;
    setInquiries((data as Inquiry[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchInquiries(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Inquiry marked as ${status.replace("_", " ")}` });
      fetchInquiries();
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Leads / Inquiries</h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage user inquiries</p>
        </div>

        <div className="flex gap-2">
          {["all", "new", "in_progress", "handled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${filter === f ? "gradient-blue text-primary-foreground shadow-blue" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
            >
              {f.replace("_", " ")}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : inquiries.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">No inquiries found.</p>
        ) : (
          <div className="space-y-3">
            {inquiries.map((inq) => (
              <div key={inq.id} className="p-4 rounded-xl border border-border bg-card shadow-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <p className="font-display font-semibold text-foreground">{inq.name}</p>
                    <Badge variant={statusVariant[inq.status] || "outline"} className="capitalize">
                      {inq.status.replace("_", " ")}
                    </Badge>
                  </div>
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
                <div className="flex gap-2 pt-1">
                  {inq.status !== "in_progress" && (
                    <button onClick={() => updateStatus(inq.id, "in_progress")} className="text-xs px-3 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors">
                      Mark In Progress
                    </button>
                  )}
                  {inq.status !== "handled" && (
                    <button onClick={() => updateStatus(inq.id, "handled")} className="text-xs px-3 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors">
                      Mark Handled
                    </button>
                  )}
                  {inq.status !== "new" && (
                    <button onClick={() => updateStatus(inq.id, "new")} className="text-xs px-3 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors">
                      Reset to New
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminInquiriesPage;
