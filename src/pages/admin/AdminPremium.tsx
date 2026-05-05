import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, X } from "lucide-react";

interface PremiumRequest {
  id: string;
  user_id: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  display_name: string | null;
}

const AdminPremium = () => {
  const [requests, setRequests] = useState<PremiumRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRequests = async () => {
    const [{ data: requestsData, error: requestsError }, { data: profilesData, error: profilesError }] = await Promise.all([
      supabase
        .from("premium_requests")
        .select("id, user_id, status, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("user_id, display_name"),
    ]);

    if (requestsError) {
      toast({ title: "Failed to load premium requests", description: requestsError.message, variant: "destructive" });
      setRequests([]);
      setLoading(false);
      return;
    }

    if (profilesError) {
      toast({ title: "Failed to load profile names", description: profilesError.message, variant: "destructive" });
    }

    const nameMap = new Map<string, string | null>();
    ((profilesData as Array<{ user_id: string; display_name: string | null }> | null) || []).forEach((profile) => {
      nameMap.set(profile.user_id, profile.display_name);
    });

    setRequests(
      ((requestsData as Array<{ id: string; user_id: string; status: "pending" | "approved" | "rejected"; created_at: string }> | null) || []).map(
        (request) => ({
          ...request,
          display_name: nameMap.get(request.user_id) || null,
        }),
      ),
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: string, userId: string, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase.from("premium_requests").update({ status }).eq("id", id);
      if (error) throw error;

      if (status === "approved") {
        // Assign premium_buyer role
        const { error: roleError } = await supabase.from("user_roles").insert({
          user_id: userId,
          role: "premium_buyer",
        });
        if (roleError && !roleError.message.includes('duplicate')) {
          throw roleError;
        }
      }

      toast({ title: `Request ${status}` });
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">Premium Approvals</h1>
          <p className="text-muted-foreground text-sm mt-1">Review requests from buyers upgrading to Premium</p>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User / Display Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    No premium upgrade requests yet.
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <div className="font-medium">{req.display_name || "Unknown"}</div>
                      <div className="text-xs text-muted-foreground">ID: {req.user_id}</div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(req.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        req.status === 'pending' ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" :
                          req.status === 'approved' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                            "bg-red-500/10 text-red-600 border-red-500/20"
                      }>
                        {req.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {req.status === "pending" && (
                        <>
                          <Button size="sm" variant="outline" className="text-emerald-600 hover:text-emerald-700" onClick={() => handleUpdateStatus(req.id, req.user_id, "approved")}>
                            <Check className="w-4 h-4 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleUpdateStatus(req.id, req.user_id, "rejected")}>
                            <X className="w-4 h-4 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPremium;
