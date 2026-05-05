import { useEffect, useState } from "react";
import AgencyLayout from "@/components/agency/AgencyLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Check, X, Calendar, MapPin } from "lucide-react";

type VisitStatus = "pending" | "confirmed" | "rescheduled" | "rejected" | "cancelled";

interface VisitRequest {
  id: string;
  user_id: string;
  property_id: string;
  name: string;
  phone: string;
  email: string;
  preferred_date: string | null;
  preferred_time: string | null;
  message: string | null;
  status: VisitStatus;
  created_at: string;
  property_title?: string;
}

const REJECT_REASONS = ["Already Sold", "Not Available at Requested Time", "Agency Policy", "Other"];

const statusBadge = (status: VisitStatus) => {
  const map: Record<VisitStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    confirmed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    rescheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    cancelled: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400",
  };
  return <Badge className={map[status] || ""}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
};

const AgencyVisits = () => {
  const { agencyId } = useAuth();
  const { toast } = useToast();
  const [visits, setVisits] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectDialog, setRejectDialog] = useState<VisitRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectOther, setRejectOther] = useState("");
  const [rescheduleDialog, setRescheduleDialog] = useState<VisitRequest | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const fetchVisits = async () => {
    if (!agencyId) return;
    setLoading(true);
    const { data: props } = await supabase.from("properties").select("id, title").eq("agency_id", agencyId);
    const propIds = (props || []).map((p: any) => p.id);
    if (propIds.length === 0) { setLoading(false); setVisits([]); return; }

    const { data, error } = await supabase
      .from("visit_requests")
      .select("*")
      .in("property_id", propIds)
      .order("created_at", { ascending: false });

    if (error) { toast({ title: "Error loading visits", description: error.message, variant: "destructive" }); }

    const propMap = new Map((props || []).map((p: any) => [p.id, p.title]));
    setVisits((data || []).map((v: any) => ({ ...v, property_title: propMap.get(v.property_id) || "Unknown" })));
    setLoading(false);
  };

  useEffect(() => { fetchVisits(); }, [agencyId]);

  const updateStatus = async (id: string, status: VisitStatus, extra?: object) => {
    const { error } = await supabase.from("visit_requests").update({ status, ...extra }).eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return false; }
    return true;
  };

  const handleAccept = async (visit: VisitRequest) => {
    if (await updateStatus(visit.id, "confirmed")) {
      toast({ title: "Visit confirmed!", description: `${visit.name} will be notified.` });
      fetchVisits();
    }
  };

  const handleReject = async () => {
    if (!rejectDialog) return;
    const reason = rejectReason === "Other" ? rejectOther : rejectReason;
    if (await updateStatus(rejectDialog.id, "rejected", { reject_reason: reason })) {
      toast({ title: "Visit rejected." });
      setRejectDialog(null);
      setRejectReason("");
      setRejectOther("");
      fetchVisits();
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleDialog || !newDate) return;
    if (await updateStatus(rescheduleDialog.id, "rescheduled", { proposed_date: newDate, proposed_time: newTime || null })) {
      toast({ title: "Reschedule proposed!", description: "The visitor will be notified." });
      setRescheduleDialog(null);
      setNewDate("");
      setNewTime("");
      fetchVisits();
    }
  };

  return (
    <AgencyLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">Visit Requests</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage property visit bookings from interested buyers</p>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : visits.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">No visit requests yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visitor</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Requested Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visits.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <p className="font-medium text-foreground">{v.name}</p>
                      <p className="text-xs text-muted-foreground">{v.email}</p>
                      <p className="text-xs text-muted-foreground">{v.phone}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-foreground flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />{v.property_title}
                      </p>
                      {v.message && <p className="text-xs text-muted-foreground mt-1 max-w-[160px] truncate">{v.message}</p>}
                    </TableCell>
                    <TableCell>
                      {v.preferred_date ? (
                        <div className="flex items-center gap-1.5 text-sm text-foreground">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          <span>{v.preferred_date}{v.preferred_time ? ` at ${v.preferred_time}` : ""}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Not specified</span>
                      )}
                    </TableCell>
                    <TableCell>{statusBadge(v.status)}</TableCell>
                    <TableCell>
                      {v.status === "pending" && (
                        <div className="flex gap-2 flex-wrap">
                          <Button size="sm" onClick={() => handleAccept(v)} className="gradient-blue text-white gap-1 border-0">
                            <Check className="w-3.5 h-3.5" /> Accept
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setRescheduleDialog(v)} className="gap-1">
                            <Calendar className="w-3.5 h-3.5" /> Reschedule
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setRejectDialog(v)} className="text-destructive border-destructive/30 gap-1">
                            <X className="w-3.5 h-3.5" /> Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={(o) => !o && setRejectDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Visit Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Rejecting visit from <strong className="text-foreground">{rejectDialog?.name}</strong></p>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Reason</label>
              <select
                className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              >
                <option value="">Select reason…</option>
                {REJECT_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
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
              <Button variant="outline" className="flex-1" onClick={() => setRejectDialog(null)}>Cancel</Button>
              <Button className="flex-1 bg-destructive text-white hover:bg-destructive/90" onClick={handleReject} disabled={!rejectReason || (rejectReason === "Other" && !rejectOther)}>
                Confirm Rejection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={!!rescheduleDialog} onOpenChange={(o) => !o && setRescheduleDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Propose New Time</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Proposing a new time for <strong className="text-foreground">{rescheduleDialog?.name}</strong></p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">New Date *</label>
                <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} min={new Date().toISOString().split("T")[0]}
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">New Time</label>
                <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setRescheduleDialog(null)}>Cancel</Button>
              <Button className="flex-1 gradient-blue text-white border-0" onClick={handleReschedule} disabled={!newDate}>
                Propose New Time
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AgencyLayout>
  );
};

export default AgencyVisits;
