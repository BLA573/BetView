import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, X, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PlanRequest {
  id: string;
  agency_id: string;
  user_id: string;
  plan_name: string;
  payment_method: string;
  proof_path: string;
  status: "pending_approval" | "approved" | "rejected";
  created_at: string;
  reject_reason?: string | null;
  agency_name?: string;
}

const AdminPlanRequests = () => {
  const [requests, setRequests] = useState<PlanRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectDialog, setRejectDialog] = useState<{ id: string; agencyId: string; planName: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectOther, setRejectOther] = useState("");
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("plan_purchase_requests")
      .select("*, agencies(name)")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Failed to load requests", description: error.message, variant: "destructive" });
    } else {
      setRequests(
        (data || []).map((r: any) => ({
          ...r,
          agency_name: r.agencies?.name || "Unknown Agency",
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const viewProof = async (path: string) => {
    const { data } = await supabase.storage.from("payment-proofs").createSignedUrl(path, 600);
    if (data?.signedUrl) setProofUrl(data.signedUrl);
  };

  const handleApprove = async (req: PlanRequest) => {
    const { error } = await supabase
      .from("plan_purchase_requests")
      .update({ status: "approved" })
      .eq("id", req.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }

    // Update agency plan
    await supabase.from("agencies").update({ plan_tier: req.plan_name }).eq("id", req.agency_id);

    toast({ title: "Plan approved!", description: `${req.agency_name}'s ${req.plan_name} plan is now active.` });
    fetchRequests();
  };

  const handleReject = async () => {
    if (!rejectDialog) return;
    const finalReason = rejectReason === "Other" ? rejectOther.trim() : rejectReason;
    if (!finalReason) return;
    const { error } = await supabase
      .from("plan_purchase_requests")
      .update({ status: "rejected", reject_reason: finalReason })
      .eq("id", rejectDialog.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Request rejected." });
    setRejectDialog(null);
    setRejectReason("");
    setRejectOther("");
    fetchRequests();
  };

  const statusBadge = (status: string) => {
    if (status === "pending_approval") return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Pending</Badge>;
    if (status === "approved") return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Approved</Badge>;
    return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Rejected</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">Plan Purchase Requests</h1>
          <p className="text-muted-foreground text-sm mt-1">Review and approve agency subscription payments</p>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">No plan requests yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agency</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Proof</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.agency_name}</TableCell>
                    <TableCell className="capitalize font-semibold text-foreground">{req.plan_name}</TableCell>
                    <TableCell className="capitalize">{req.payment_method === "cbe" ? "CBE Transfer" : "Telebirr"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{new Date(req.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{statusBadge(req.status)}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => viewProof(req.proof_path)} className="gap-1">
                        <ExternalLink className="w-3 h-3" /> View
                      </Button>
                    </TableCell>
                    <TableCell>
                      {req.status === "pending_approval" && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleApprove(req)} className="gradient-blue text-white gap-1 border-0">
                            <Check className="w-3.5 h-3.5" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setRejectDialog({ id: req.id, agencyId: req.agency_id, planName: req.plan_name })} className="text-destructive border-destructive/30 gap-1">
                            <X className="w-3.5 h-3.5" /> Reject
                          </Button>
                        </div>
                      )}
                      {req.status === "rejected" && req.reject_reason && (
                        <p className="text-xs text-muted-foreground max-w-[160px]">{req.reject_reason}</p>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Proof Preview Dialog */}
      <Dialog open={!!proofUrl} onOpenChange={(o) => !o && setProofUrl(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Proof</DialogTitle>
          </DialogHeader>
          {proofUrl && (
            proofUrl.endsWith(".pdf") ? (
              <iframe src={proofUrl} className="w-full h-96 rounded-lg border border-border" />
            ) : (
              <img src={proofUrl} alt="Payment proof" className="w-full rounded-lg max-h-96 object-contain" />
            )
          )}
          <a href={proofUrl || "#"} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
            <ExternalLink className="w-4 h-4" /> Open in new tab
          </a>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={(o) => !o && setRejectDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Plan Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Reason for rejection</label>
              <select
                className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              >
                <option value="">Select a reason…</option>
                <option value="Payment amount incorrect">Payment amount incorrect</option>
                <option value="Payment proof unclear or invalid">Payment proof unclear or invalid</option>
                <option value="Account details mismatch">Account details mismatch</option>
                <option value="Duplicate submission">Duplicate submission</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {rejectReason === "Other" && (
              <textarea
                className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm resize-none"
                rows={3}
                placeholder="Please provide more details…"
                value={rejectOther}
                onChange={(e) => setRejectOther(e.target.value)}
              />
            )}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => { setRejectDialog(null); setRejectReason(""); setRejectOther(""); }}>Cancel</Button>
              <Button
                className="flex-1 bg-destructive text-white hover:bg-destructive/90"
                onClick={handleReject}
                disabled={!rejectReason || (rejectReason === "Other" && !rejectOther.trim())}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminPlanRequests;
