import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Loader2, Link2, Pencil, ScanLine, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ScanStatus = "pending" | "scheduled" | "in_progress" | "completed" | "cancelled";
type Priority = "low" | "normal" | "high";

type ScanRequest = {
    id: string;
    agency_id: string;
    property_id: string | null;
    address: string;
    property_type: string;
    contact_person: string;
    contact_phone: string;
    notes: string | null;
    preferred_date: string | null;
    assigned_staff: string | null;
    priority: Priority;
    status: ScanStatus;
    created_at: string;
    updated_at: string;
    agencies: { name: string } | null;
    properties: { title: string } | null;
};

type PropertyOption = {
    id: string;
    title: string;
    agency_id: string;
};

const statusVariant: Record<ScanStatus, "default" | "secondary" | "outline" | "destructive"> = {
    pending: "secondary",
    scheduled: "default",
    in_progress: "default",
    completed: "outline",
    cancelled: "destructive",
};

const statusTransitions: Record<ScanStatus, ScanStatus[]> = {
    pending: ["scheduled", "cancelled"],
    scheduled: ["in_progress", "cancelled"],
    in_progress: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
};

const priorityVariant: Record<Priority, string> = {
    low: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    normal: "bg-muted text-muted-foreground border-border",
    high: "bg-red-500/10 text-red-600 border-red-500/20",
};

const AdminScanRequests = () => {
    const { toast } = useToast();
    const [requests, setRequests] = useState<ScanRequest[]>([]);
    const [properties, setProperties] = useState<PropertyOption[]>([]);
    const [hasEnhancedColumns, setHasEnhancedColumns] = useState(true);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [detailsId, setDetailsId] = useState<string | null>(null);
    const [editId, setEditId] = useState<string | null>(null);
    const [assignId, setAssignId] = useState<string | null>(null);
    const [linkingId, setLinkingId] = useState<string | null>(null);
    const [selectedPropertyId, setSelectedPropertyId] = useState<Record<string, string>>({});
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [agencyFilter, setAgencyFilter] = useState<string>("all");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [search, setSearch] = useState("");
    const [editForm, setEditForm] = useState<{
        address: string;
        property_type: string;
        contact_person: string;
        contact_phone: string;
        preferred_date: string;
        assigned_staff: string;
        priority: Priority;
        notes: string;
    }>({
        address: "",
        property_type: "",
        contact_person: "",
        contact_phone: "",
        preferred_date: "",
        assigned_staff: "",
        priority: "normal",
        notes: "",
    });

    const hasMissingEnhancedColumnsError = (message: string) => {
        const lower = message.toLowerCase();
        return lower.includes("assigned_staff") || lower.includes("priority");
    };

    const normalizeRows = (rows: any[] | null, enhancedColumnsAvailable: boolean): ScanRequest[] => {
        return (rows || []).map((row) => ({
            ...row,
            assigned_staff: enhancedColumnsAvailable ? row.assigned_staff ?? null : null,
            priority: enhancedColumnsAvailable ? (row.priority || "normal") : "normal",
            updated_at: row.updated_at || row.created_at,
        })) as ScanRequest[];
    };

    const fetchRequests = async () => {
        setLoading(true);
        const [{ data: fullData, error: fullError }, { data: propertyData }] = await Promise.all([
            supabase
                .from("scan_requests" as never)
                .select(
                    `
            id,
            agency_id,
            property_id,
            address,
            property_type,
            contact_person,
            contact_phone,
            notes,
            preferred_date,
            assigned_staff,
            priority,
            status,
            created_at,
            updated_at,
            agencies(name),
            properties(title)
          ` as never,
                )
                .order("created_at", { ascending: false }),
            supabase.from("properties").select("id, title, agency_id").order("created_at", { ascending: false }),
        ]);

        if (fullError && hasMissingEnhancedColumnsError(fullError.message)) {
            const { data: fallbackData, error: fallbackError } = await supabase
                .from("scan_requests" as never)
                .select(
                    `
            id,
            agency_id,
            property_id,
            address,
            property_type,
            contact_person,
            contact_phone,
            notes,
            preferred_date,
            status,
            created_at,
            updated_at,
            agencies(name),
            properties(title)
          ` as never,
                )
                .order("created_at", { ascending: false });

            if (fallbackError) {
                toast({ title: "Failed to load scan requests", description: fallbackError.message, variant: "destructive" });
                setRequests([]);
            } else {
                setHasEnhancedColumns(false);
                setRequests(normalizeRows(fallbackData as any[], false));
                toast({ title: "Scan requests loaded", description: "Assigned staff and priority fields are unavailable until latest migration is applied." });
            }
        } else if (fullError) {
            toast({ title: "Failed to load scan requests", description: fullError.message, variant: "destructive" });
            setRequests([]);
        } else {
            setHasEnhancedColumns(true);
            setRequests(normalizeRows(fullData as any[], true));
        }

        setProperties((propertyData as PropertyOption[]) || []);

        setLoading(false);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const filteredRequests = useMemo(() => {
        const q = search.trim().toLowerCase();
        return requests.filter((request) => {
            if (statusFilter !== "all" && request.status !== statusFilter) return false;
            if (agencyFilter !== "all" && request.agency_id !== agencyFilter) return false;
            if (fromDate && new Date(request.created_at) < new Date(`${fromDate}T00:00:00`)) return false;
            if (toDate && new Date(request.created_at) > new Date(`${toDate}T23:59:59`)) return false;
            if (!q) return true;

            const text = [
                request.id,
                request.contact_person,
                request.contact_phone,
                request.address,
                request.properties?.title || "",
            ]
                .join(" ")
                .toLowerCase();

            return text.includes(q);
        });
    }, [requests, statusFilter, agencyFilter, fromDate, toDate, search]);

    const agencyOptions = useMemo(() => {
        const map = new Map<string, string>();
        requests.forEach((request) => map.set(request.agency_id, request.agencies?.name || request.agency_id));
        return [...map.entries()].map(([id, name]) => ({ id, name }));
    }, [requests]);

    const setStatus = async (request: ScanRequest, status: ScanStatus) => {
        if (!statusTransitions[request.status].includes(status)) {
            toast({ title: "Invalid status transition", description: `${request.status} cannot move to ${status}.`, variant: "destructive" });
            return;
        }

        setUpdatingId(request.id);
        const { error } = await supabase.from("scan_requests" as never).update({ status } as never).eq("id", request.id);

        if (error) {
            toast({ title: "Update failed", description: error.message, variant: "destructive" });
        } else {
            toast({ title: `Request marked ${status.replace("_", " ")}` });
            setRequests((prev) => prev.map((r) => (r.id === request.id ? { ...r, status } : r)));
        }

        setUpdatingId(null);
    };

    const openEdit = (request: ScanRequest) => {
        setEditId(request.id);
        setEditForm({
            address: request.address,
            property_type: request.property_type,
            contact_person: request.contact_person,
            contact_phone: request.contact_phone,
            preferred_date: request.preferred_date ? new Date(request.preferred_date).toISOString().slice(0, 16) : "",
            assigned_staff: request.assigned_staff || "",
            priority: request.priority || "normal",
            notes: request.notes || "",
        });
    };

    const saveEdit = async (id: string) => {
        setUpdatingId(id);
        const payload = {
            address: editForm.address,
            property_type: editForm.property_type,
            contact_person: editForm.contact_person,
            contact_phone: editForm.contact_phone,
            preferred_date: editForm.preferred_date ? new Date(editForm.preferred_date).toISOString() : null,
            notes: editForm.notes || null,
            ...(hasEnhancedColumns
                ? {
                    assigned_staff: editForm.assigned_staff || null,
                    priority: editForm.priority,
                }
                : {}),
        };

        const { error } = await supabase.from("scan_requests" as never).update(payload as never).eq("id", id);
        if (error) {
            toast({ title: "Failed to save request", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Request updated" });
            setRequests((prev) =>
                prev.map((r) =>
                    r.id === id
                        ? {
                            ...r,
                            ...payload,
                        }
                        : r,
                ),
            );
            setEditId(null);
        }

        setUpdatingId(null);
    };

    const assignProperty = async (request: ScanRequest) => {
        const propertyId = selectedPropertyId[request.id];
        if (!propertyId) {
            toast({ title: "Select a property first", variant: "destructive" });
            return;
        }

        const property = properties.find((p) => p.id === propertyId);
        if (!property || property.agency_id !== request.agency_id) {
            toast({ title: "Invalid property selection", description: "Property must belong to the same agency.", variant: "destructive" });
            return;
        }

        setLinkingId(request.id);
        const { error } = await supabase.from("scan_requests" as never).update({ property_id: propertyId } as never).eq("id", request.id);
        if (error) {
            toast({ title: "Failed to assign property", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Property linked to request" });
            setRequests((prev) =>
                prev.map((r) => (r.id === request.id ? { ...r, property_id: propertyId, properties: { title: property.title } } : r)),
            );
            setAssignId(null);
        }
        setLinkingId(null);
    };

    const createPropertyFromRequest = async (request: ScanRequest) => {
        setLinkingId(request.id);

        const { data, error } = await supabase
            .from("properties")
            .insert({
                agency_id: request.agency_id,
                title: `Scan Request - ${request.address}`,
                location: request.address,
                type: request.property_type || "Apartment",
                price: "TBD",
                status: "pending",
                description: request.notes || "Generated from scan request",
                rooms: 1,
                images: [],
            })
            .select("id, title")
            .single();

        if (error || !data) {
            toast({ title: "Failed to create property", description: error?.message || "Unknown error", variant: "destructive" });
            setLinkingId(null);
            return;
        }

        const { error: linkError } = await supabase.from("scan_requests" as never).update({ property_id: data.id } as never).eq("id", request.id);
        if (linkError) {
            toast({ title: "Property created but linking failed", description: linkError.message, variant: "destructive" });
        } else {
            toast({ title: "Property created and linked" });
            setProperties((prev) => [{ id: data.id, title: data.title, agency_id: request.agency_id }, ...prev]);
            setRequests((prev) => prev.map((r) => (r.id === request.id ? { ...r, property_id: data.id, properties: { title: data.title } } : r)));
            setAssignId(null);
        }

        setLinkingId(null);
    };

    const deleteRequest = async (request: ScanRequest) => {
        if (!confirm(`Delete scan request ${request.id.slice(0, 8)}?`)) return;

        setUpdatingId(request.id);
        const { error } = await supabase.from("scan_requests" as never).delete().eq("id", request.id);
        if (error) {
            toast({ title: "Delete failed", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Scan request deleted" });
            setRequests((prev) => prev.filter((r) => r.id !== request.id));
        }
        setUpdatingId(null);
    };

    const isOverdue = (request: ScanRequest) => {
        if (!request.preferred_date) return false;
        if (request.status === "completed" || request.status === "cancelled") return false;
        return new Date(request.preferred_date).getTime() < Date.now();
    };

    const isUpcoming = (request: ScanRequest) => {
        if (!request.preferred_date) return false;
        if (request.status === "completed" || request.status === "cancelled") return false;
        return new Date(request.preferred_date).getTime() >= Date.now();
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
                        <ScanLine className="w-6 h-6 text-primary" /> Scan Requests
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Review, schedule, and manage scan requests submitted by agencies</p>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search contact, phone, property, request ID"
                        className="md:col-span-2"
                    />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={agencyFilter} onValueChange={setAgencyFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter agency" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All agencies</SelectItem>
                            {agencyOptions.map((agency) => (
                                <SelectItem key={agency.id} value={agency.id}>
                                    {agency.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="grid grid-cols-2 gap-2">
                        <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                        <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <p className="text-center text-muted-foreground py-16">No scan requests yet.</p>
                ) : (
                    <div className="space-y-3">
                        {filteredRequests.map((request) => (
                            <div key={request.id} className="p-4 rounded-xl border border-border bg-card shadow-card space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="font-semibold text-foreground truncate">{request.properties?.title || request.address}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Agency:{" "}
                                            <Link to="/admin/agencies" className="text-primary hover:underline">
                                                {request.agencies?.name || request.agency_id}
                                            </Link>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={statusVariant[request.status]} className="capitalize">
                                            {request.status.replace("_", " ")}
                                        </Badge>
                                        {hasEnhancedColumns && (
                                            <Badge variant="outline" className={priorityVariant[request.priority || "normal"]}>
                                                {(request.priority || "normal").toUpperCase()}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                                    <p>Request ID: {request.id}</p>
                                    <p>Property ID: {request.property_id || "Not assigned"}</p>
                                    <p>Type: {request.property_type}</p>
                                    <p>Contact: {request.contact_person}</p>
                                    <p>Phone: {request.contact_phone}</p>
                                    <p>Requested: {new Date(request.created_at).toLocaleString()}</p>
                                    <p>Updated: {new Date(request.updated_at).toLocaleString()}</p>
                                    <p>Scheduled: {request.preferred_date ? new Date(request.preferred_date).toLocaleString() : "Not set"}</p>
                                    {hasEnhancedColumns && <p>Assigned Staff: {request.assigned_staff || "Unassigned"}</p>}
                                    <p className="md:col-span-2">
                                        {isOverdue(request) ? (
                                            <span className="text-destructive font-medium">Overdue</span>
                                        ) : isUpcoming(request) ? (
                                            <span className="text-emerald-600 font-medium">Upcoming</span>
                                        ) : (
                                            <span>No schedule</span>
                                        )}
                                    </p>
                                </div>

                                {request.notes && (
                                    <div className="text-sm text-foreground bg-secondary/40 rounded-lg p-3">
                                        {request.notes}
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-2 pt-1">
                                    <button
                                        onClick={() => setDetailsId(detailsId === request.id ? null : request.id)}
                                        className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-secondary transition-colors"
                                    >
                                        View full details
                                    </button>
                                    <button
                                        onClick={() => openEdit(request)}
                                        className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-secondary transition-colors inline-flex items-center gap-1"
                                    >
                                        <Pencil className="w-3 h-3" /> Edit request
                                    </button>
                                    <button
                                        onClick={() => setAssignId(assignId === request.id ? null : request.id)}
                                        className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-secondary transition-colors inline-flex items-center gap-1"
                                    >
                                        <Link2 className="w-3 h-3" /> Assign property
                                    </button>

                                    <Select
                                        value={request.status}
                                        onValueChange={(next) => setStatus(request, next as ScanStatus)}
                                        disabled={updatingId === request.id || statusTransitions[request.status].length === 0}
                                    >
                                        <SelectTrigger className="h-8 w-[170px]">
                                            <SelectValue placeholder="Update status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={request.status}>{request.status.replace("_", " ")}</SelectItem>
                                            {statusTransitions[request.status].map((next) => (
                                                <SelectItem key={next} value={next}>
                                                    {next.replace("_", " ")}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <button
                                        onClick={() => deleteRequest(request)}
                                        disabled={updatingId === request.id}
                                        className="text-xs px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive bg-destructive/5 hover:bg-destructive/10 transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                                    >
                                        <Trash2 className="w-3 h-3" /> Delete
                                    </button>
                                </div>

                                {detailsId === request.id && (
                                    <div className="rounded-lg border border-border bg-secondary/30 p-3 text-sm space-y-1">
                                        <p><span className="font-medium">Address:</span> {request.address}</p>
                                        <p><span className="font-medium">Contact Person:</span> {request.contact_person}</p>
                                        <p><span className="font-medium">Contact Phone:</span> {request.contact_phone}</p>
                                        <p><span className="font-medium">Agency ID:</span> {request.agency_id}</p>
                                        <p><span className="font-medium">Property:</span> {request.properties?.title || "Not linked"}</p>
                                    </div>
                                )}

                                {editId === request.id && (
                                    <div className="rounded-lg border border-border bg-secondary/30 p-3 space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <Input value={editForm.address} onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))} placeholder="Address" />
                                            <Input value={editForm.property_type} onChange={(e) => setEditForm((f) => ({ ...f, property_type: e.target.value }))} placeholder="Property type" />
                                            <Input value={editForm.contact_person} onChange={(e) => setEditForm((f) => ({ ...f, contact_person: e.target.value }))} placeholder="Contact person" />
                                            <Input value={editForm.contact_phone} onChange={(e) => setEditForm((f) => ({ ...f, contact_phone: e.target.value }))} placeholder="Contact phone" />
                                            <Input type="datetime-local" value={editForm.preferred_date} onChange={(e) => setEditForm((f) => ({ ...f, preferred_date: e.target.value }))} />
                                            {hasEnhancedColumns && (
                                                <Input value={editForm.assigned_staff} onChange={(e) => setEditForm((f) => ({ ...f, assigned_staff: e.target.value }))} placeholder="Assigned staff (optional)" />
                                            )}
                                        </div>
                                        {hasEnhancedColumns && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <Select value={editForm.priority} onValueChange={(value) => setEditForm((f) => ({ ...f, priority: value as Priority }))}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Priority" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="low">Low</SelectItem>
                                                        <SelectItem value="normal">Normal</SelectItem>
                                                        <SelectItem value="high">High</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                        <Textarea value={editForm.notes} onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))} rows={3} placeholder="Notes" />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => saveEdit(request.id)}
                                                disabled={updatingId === request.id}
                                                className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-colors disabled:opacity-50"
                                            >
                                                {updatingId === request.id ? "Saving..." : "Save changes"}
                                            </button>
                                            <button onClick={() => setEditId(null)} className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-secondary transition-colors">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {assignId === request.id && (
                                    <div className="rounded-lg border border-border bg-secondary/30 p-3 space-y-3">
                                        <Select
                                            value={selectedPropertyId[request.id] || ""}
                                            onValueChange={(value) => setSelectedPropertyId((prev) => ({ ...prev, [request.id]: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select existing property" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {properties
                                                    .filter((property) => property.agency_id === request.agency_id)
                                                    .map((property) => (
                                                        <SelectItem key={property.id} value={property.id}>
                                                            {property.title}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => assignProperty(request)}
                                                disabled={linkingId === request.id}
                                                className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-colors disabled:opacity-50"
                                            >
                                                {linkingId === request.id ? "Linking..." : "Link selected property"}
                                            </button>
                                            <button
                                                onClick={() => createPropertyFromRequest(request)}
                                                disabled={linkingId === request.id}
                                                className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-secondary transition-colors disabled:opacity-50"
                                            >
                                                {linkingId === request.id ? "Creating..." : "Create property from request"}
                                            </button>
                                        </div>
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

export default AdminScanRequests;
