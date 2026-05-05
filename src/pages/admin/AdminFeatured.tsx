import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, X, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const AdminFeatured = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRequests = async () => {
    const { data } = await supabase
      .from("featured_listings")
      .select(`
        id, status, duration_days, price, created_at, start_date, end_date, property_id,
        properties ( title ),
        agencies ( name )
      `)
      .order("created_at", { ascending: false });

    setRequests(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: "active" | "rejected", durationDays: number | null) => {
    if (!user) return;
    try {
      const updates: any = { 
        status: newStatus,
        approved_by: user.id
      };

      if (newStatus === "active" && durationDays) {
        const start = new Date();
        const end = new Date();
        end.setDate(end.getDate() + durationDays);
        
        updates.start_date = start.toISOString();
        updates.end_date = end.toISOString();
      }

      const { error } = await supabase.from("featured_listings").update(updates).eq("id", id);
      if (error) throw error;

      toast({ title: `Request ${newStatus}` });
      fetchRequests();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" /> Featured Listings Approvals
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Review requests from agencies wanting to highlight their properties</p>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agency / Property</TableHead>
                  <TableHead>Duration / Price</TableHead>
                  <TableHead>Date Requested</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No featured placement requests yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">{req.properties?.title || "Property Loading..."}</div>
                        <div className="text-xs text-muted-foreground">By: {req.agencies?.name}</div>
                      </TableCell>
                      <TableCell>
                        <div>{req.duration_days} Days</div>
                        <div className="text-xs font-semibold text-primary">{Number(req.price).toLocaleString()} ETB</div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(req.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          req.status === 'pending' ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" :
                          req.status === 'active' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                          req.status === 'expired' ? "bg-muted text-muted-foreground border-border" :
                          "bg-red-500/10 text-red-600 border-red-500/20"
                        }>
                          {req.status}
                        </Badge>
                        {req.status === 'active' && req.end_date && (
                          <div className="text-[10px] mt-1 text-muted-foreground">
                            Ends: {new Date(req.end_date).toLocaleDateString()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {req.status === "pending" && (
                          <>
                            <Button size="sm" variant="outline" className="text-emerald-600 hover:text-emerald-700" onClick={() => handleUpdateStatus(req.id, "active", req.duration_days)}>
                              <Check className="w-4 h-4 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleUpdateStatus(req.id, "rejected", null)}>
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

export default AdminFeatured;
