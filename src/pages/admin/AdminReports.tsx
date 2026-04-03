import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Flag, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";

interface Report {
  id: string;
  reporter_id: string;
  target_type: string;
  target_id: string;
  reason: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const AdminReports = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });
    setReports((data as Report[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, []);

  const updateReport = async (id: string, status: string, adminNotes?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("reports").update({
      status,
      admin_notes: adminNotes || null,
      resolved_by: user?.id || null,
    }).eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Report ${status}` });
      if (user) {
        await supabase.from("activity_logs").insert({
          admin_id: user.id,
          action: `Report ${status}`,
          target_table: "reports",
          target_id: id,
        });
      }
      fetchReports();
    }
  };

  const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    pending: "default",
    resolved: "outline",
    dismissed: "secondary",
    actioned: "destructive",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Reports / Moderation</h1>
          <p className="text-sm text-muted-foreground mt-1">Review flagged properties and users</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16">
            <Flag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No reports yet. The platform is clean!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <div key={r.id} className="p-4 rounded-xl border border-border bg-card shadow-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="font-medium text-foreground capitalize">{r.target_type}</span>
                    <Badge variant={statusVariant[r.status] || "outline"} className="capitalize">
                      {r.status}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-foreground">{r.reason}</p>
                <p className="text-xs text-muted-foreground">Target: {r.target_id.slice(0, 8)}… · Reporter: {r.reporter_id.slice(0, 8)}…</p>
                {r.admin_notes && (
                  <p className="text-xs text-muted-foreground bg-secondary/50 px-3 py-2 rounded-lg">
                    Admin: {r.admin_notes}
                  </p>
                )}
                {r.status === "pending" && (
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => updateReport(r.id, "resolved")} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors">
                      <CheckCircle className="w-3 h-3" /> Resolve
                    </button>
                    <button onClick={() => updateReport(r.id, "actioned")} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors">
                      <XCircle className="w-3 h-3" /> Take Action
                    </button>
                    <button onClick={() => updateReport(r.id, "dismissed")} className="text-xs px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors">
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
