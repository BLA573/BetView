import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Edit, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import PropertyFormModal from "@/components/admin/PropertyFormModal";
import { Badge } from "@/components/ui/badge";

interface DbProperty {
  id: string;
  title: string;
  location: string;
  price: string;
  mode: string;
  type: string;
  rooms: number;
  images: string[];
  status: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  approved: { label: "Approved", variant: "default" },
  pending: { label: "Pending", variant: "secondary" },
  rejected: { label: "Rejected", variant: "destructive" },
};

const AdminListings = () => {
  const { toast } = useToast();
  const [properties, setProperties] = useState<DbProperty[]>([]);
  const [fetching, setFetching] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const fetchProperties = async () => {
    setFetching(true);
    let query = supabase
      .from("properties")
      .select("id, title, location, price, mode, type, rooms, images, status, created_at")
      .order("created_at", { ascending: false });

    if (filter !== "all") query = query.eq("status", filter);

    const { data, error } = await query;
    if (error) {
      toast({ title: "Error loading", description: error.message, variant: "destructive" });
    } else {
      setProperties((data as DbProperty[]) || []);
    }
    setFetching(false);
  };

  useEffect(() => {
    fetchProperties();
  }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("properties").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Property ${status}` });
      // Log activity
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("activity_logs").insert({
          admin_id: user.id,
          action: `Property ${status}`,
          target_table: "properties",
          target_id: id,
        });
      }
      fetchProperties();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this property?")) return;
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Property deleted" });
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("activity_logs").insert({
          admin_id: user.id,
          action: "Property deleted",
          target_table: "properties",
          target_id: id,
        });
      }
      fetchProperties();
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Listings</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage all property listings</p>
          </div>
          <button
            onClick={() => { setEditId(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-blue text-primary-foreground font-medium shadow-blue hover:opacity-90 transition-all text-sm"
          >
            <Plus className="w-4 h-4" /> Add Property
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {["all", "approved", "pending", "rejected"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                filter === f ? "gradient-blue text-primary-foreground shadow-blue" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {fetching ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : properties.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">No properties found.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left p-3 font-medium text-muted-foreground">Property</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Location</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Price</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => {
                  const sc = statusConfig[p.status] || statusConfig.approved;
                  return (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0] || "/placeholder.svg"}
                            alt={p.title}
                            className="w-12 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{p.title}</p>
                            <p className="text-xs text-muted-foreground">{p.type} · {p.mode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell">{p.location}</td>
                      <td className="p-3 font-medium text-foreground">{p.price}</td>
                      <td className="p-3">
                        <Badge variant={sc.variant}>{sc.label}</Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-1">
                          {p.status !== "approved" && (
                            <button onClick={() => updateStatus(p.id, "approved")} className="p-1.5 rounded-lg hover:bg-emerald-50 transition-colors" title="Approve">
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                            </button>
                          )}
                          {p.status !== "rejected" && (
                            <button onClick={() => updateStatus(p.id, "rejected")} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors" title="Reject">
                              <XCircle className="w-4 h-4 text-destructive" />
                            </button>
                          )}
                          {p.status !== "pending" && (
                            <button onClick={() => updateStatus(p.id, "pending")} className="p-1.5 rounded-lg hover:bg-amber-50 transition-colors" title="Set Pending">
                              <Clock className="w-4 h-4 text-amber-600" />
                            </button>
                          )}
                          <button onClick={() => { setEditId(p.id); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-secondary transition-colors" title="Edit">
                            <Edit className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <PropertyFormModal
          propertyId={editId}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchProperties(); }}
        />
      )}
    </AdminLayout>
  );
};

export default AdminListings;
