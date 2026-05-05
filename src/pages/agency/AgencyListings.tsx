import { useEffect, useState } from "react";
import AgencyLayout from "@/components/agency/AgencyLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { MapPin, BedDouble, Maximize2, Eye, Loader2, CheckCircle2, Clock, XCircle } from "lucide-react";

interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  type: string;
  rooms: number;
  living_space: string | null;
  status: string;
  is_verified: boolean;
  images: string[];
  tour_url: string | null;
}

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; className: string }> = {
  approved: { label: "Approved", icon: CheckCircle2, className: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  pending: { label: "Pending", icon: Clock, className: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  rejected: { label: "Rejected", icon: XCircle, className: "text-red-600 bg-red-50 border-red-200" },
};

const AgencyListings = () => {
  const { agencyId } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!agencyId) return;
    supabase
      .from("properties")
      .select("id, title, location, price, type, rooms, living_space, status, is_verified, images, tour_url")
      .eq("agency_id", agencyId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProperties((data as Property[]) || []);
        setLoading(false);
      });
  }, [agencyId]);

  return (
    <AgencyLayout>
      <div className="space-y-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground">My Listings</h1>
            <p className="text-muted-foreground text-sm mt-1">Properties assigned to your agency by BetView</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-2">No listings assigned yet</p>
              <p className="text-sm text-muted-foreground">Request a property scan and our team will add the listing for you.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {properties.map((p) => {
                const st = statusConfig[p.status] || statusConfig.pending;
                const StIcon = st.icon;
                return (
                  <div key={p.id} className="flex gap-4 p-4 rounded-xl border border-border bg-card shadow-card">
                    <div className="w-24 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img src={p.images?.[0] || "/placeholder.svg"} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-display font-semibold text-foreground truncate">{p.title}</h3>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{p.location || "—"}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {p.is_verified && (
                            <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 text-xs">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                            </Badge>
                          )}
                          <Badge variant="outline" className={`text-xs border ${st.className}`}>
                            <StIcon className="w-3 h-3 mr-1" /> {st.label}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="font-display font-semibold text-foreground">{p.price}</span>
                        <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" />{p.rooms} rooms</span>
                        {p.living_space && <span className="flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5" />{p.living_space}</span>}
                        {p.tour_url && <span className="flex items-center gap-1 text-primary"><Eye className="w-3.5 h-3.5" />360° Tour</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </AgencyLayout>
  );
};

export default AgencyListings;
