import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, Edit, Loader2, LogOut, MessageSquare } from "lucide-react";
import PropertyFormModal from "@/components/admin/PropertyFormModal";
import AdminInquiries from "@/components/admin/AdminInquiries";

interface DbProperty {
  id: string;
  title: string;
  location: string;
  price: string;
  mode: string;
  type: string;
  rooms: number;
  images: string[];
  created_at: string;
}

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [properties, setProperties] = useState<DbProperty[]>([]);
  const [fetching, setFetching] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<"properties" | "inquiries">("properties");

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate("/");
  }, [user, isAdmin, loading, navigate]);

  const fetchProperties = async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from("properties")
      .select("id, title, location, price, mode, type, rooms, images, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error loading properties", description: error.message, variant: "destructive" });
    } else {
      setProperties(data || []);
    }
    setFetching(false);
  };

  useEffect(() => {
    if (isAdmin) fetchProperties();
  }, [isAdmin]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this property?")) return;
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Property deleted" });
      fetchProperties();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-16 py-4 bg-card/80 backdrop-blur-lg border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center shadow-blue">
            <span className="text-primary-foreground font-display font-bold text-sm">B</span>
          </div>
          <span className="font-display font-semibold text-xl text-foreground tracking-tight">
            Admin Dashboard
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <button onClick={signOut} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 md:px-16 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("properties")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === "properties" ? "gradient-blue text-primary-foreground shadow-blue" : "bg-secondary text-secondary-foreground"}`}
          >
            Properties
          </button>
          <button
            onClick={() => setTab("inquiries")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${tab === "inquiries" ? "gradient-blue text-primary-foreground shadow-blue" : "bg-secondary text-secondary-foreground"}`}
          >
            <MessageSquare className="w-4 h-4" /> Inquiries
          </button>
        </div>

        {tab === "inquiries" ? (
          <AdminInquiries />
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-2xl text-foreground">Manage Properties</h2>
              <button
                onClick={() => { setEditId(null); setShowForm(true); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-blue text-primary-foreground font-medium shadow-blue hover:opacity-90 transition-all text-sm"
              >
                <Plus className="w-4 h-4" /> Add Property
              </button>
            </div>

            {fetching ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : properties.length === 0 ? (
              <p className="text-center text-muted-foreground py-16">No properties yet. Add your first listing!</p>
            ) : (
              <div className="space-y-3">
                {properties.map((p) => (
                  <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card shadow-card">
                    <img
                      src={p.images?.[0] || "/placeholder.svg"}
                      alt={p.title}
                      className="w-20 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-foreground truncate">{p.title}</p>
                      <p className="text-sm text-muted-foreground">{p.location} · {p.mode} · {p.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditId(p.id); setShowForm(true); }}
                        className="p-2 rounded-lg hover:bg-secondary transition-colors"
                      >
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {showForm && (
        <PropertyFormModal
          propertyId={editId}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchProperties(); }}
        />
      )}
    </main>
  );
};

export default Admin;
