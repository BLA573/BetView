import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, X, ShieldAlert } from "lucide-react";

interface Agency {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  status: "pending" | "approved" | "suspended" | "rejected";
  plan_tier: string;
  created_at: string;
}

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  suspended: "bg-red-500/10 text-red-600 border-red-500/20",
  rejected: "bg-muted text-muted-foreground border-border",
};

const AdminAgencies = () => {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAgencies = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("agencies")
      .select("id, name, email, phone, status, plan_tier, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Failed to load agencies", description: error.message, variant: "destructive" });
      setAgencies([]);
    } else {
      setAgencies((data as Agency[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAgencies();
  }, []);

  const handleUpdateStatus = async (id: string, status: Agency["status"]) => {
    const { error } = await supabase.from("agencies").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Agency status updated" });
      setAgencies((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground">Agencies</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage platform agencies and subscriptions</p>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agency Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Plan</TableHead>
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
                ) : agencies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No agencies found.
                    </TableCell>
                  </TableRow>
                ) : (
                  agencies.map((agency) => (
                    <TableRow key={agency.id}>
                      <TableCell className="font-medium">{agency.name}</TableCell>
                      <TableCell>
                        <div className="text-sm">{agency.email || "No public email"}</div>
                        <div className="text-xs text-muted-foreground">{agency.phone}</div>
                      </TableCell>
                      <TableCell className="capitalize">{agency.plan_tier}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[agency.status]}>
                          {agency.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {agency.status === "pending" && (
                          <>
                            <Button size="sm" variant="outline" className="text-emerald-600 hover:text-emerald-700" onClick={() => handleUpdateStatus(agency.id, "approved")}>
                              <Check className="w-4 h-4 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleUpdateStatus(agency.id, "rejected")}>
                              <X className="w-4 h-4 mr-1" /> Reject
                            </Button>
                          </>
                        )}
                        {agency.status === "approved" && (
                          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleUpdateStatus(agency.id, "suspended")}>
                            <ShieldAlert className="w-4 h-4 mr-1" /> Suspend
                          </Button>
                        )}
                        {agency.status === "suspended" && (
                          <Button size="sm" variant="outline" className="text-emerald-600 hover:text-emerald-700" onClick={() => handleUpdateStatus(agency.id, "approved")}>
                            <Check className="w-4 h-4 mr-1" /> Unsuspend
                          </Button>
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

export default AdminAgencies;
