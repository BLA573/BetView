import { useEffect, useState } from "react";
import AgencyLayout from "@/components/agency/AgencyLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Building2, MessageSquare, Star, CreditCard, Loader2 } from "lucide-react";

interface Stats {
  listings: number;
  inquiries: number;
  featured: number;
  tier: string;
}

const AgencyOverview = () => {
  const { agencyId } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!agencyId) {
      setLoading(false);
      setError("No agency profile is linked to this account.");
      return;
    }

    const fetch = async () => {
      setError(null);
      const [listingsRes, inquiriesRes, agencyRes] = await Promise.all([
        supabase.from("properties").select("id", { count: "exact", head: true }).eq("agency_id", agencyId),
        supabase
          .from("inquiries")
          .select("id, properties!inner(agency_id)", { count: "exact", head: true })
          .eq("properties.agency_id", agencyId),
        supabase.from("agencies").select("plan_tier").eq("id", agencyId).single(),
      ]);

      if (listingsRes.error || inquiriesRes.error || agencyRes.error) {
        setError(
          listingsRes.error?.message || inquiriesRes.error?.message || agencyRes.error?.message || "Failed to load agency dashboard.",
        );
        setLoading(false);
        return;
      }

      setStats({
        listings: listingsRes.count || 0,
        inquiries: inquiriesRes.count || 0,
        featured: 0,
        tier: agencyRes.data?.plan_tier || "basic",
      });
      setLoading(false);
    };
    fetch();
  }, [agencyId]);

  const cards = stats
    ? [
      { label: "My Listings", value: String(stats.listings), icon: Building2, color: "text-primary" },
      { label: "Active Inquiries", value: String(stats.inquiries), icon: MessageSquare, color: "text-blue-500" },
      { label: "Featured Active", value: String(stats.featured), icon: Star, color: "text-yellow-500" },
      { label: "Current Plan", value: stats.tier.charAt(0).toUpperCase() + stats.tier.slice(1), icon: CreditCard, color: "text-emerald-500" },
    ]
    : [];

  return (
    <AgencyLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Welcome to your agency portal</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
              <div key={card.label} className="p-5 rounded-xl border border-border bg-card shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">{card.label}</span>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <p className="font-display font-bold text-2xl text-foreground">{card.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a href="/agency/scan-request" className="p-5 rounded-xl border border-border bg-card shadow-card hover:shadow-blue hover:-translate-y-0.5 transition-all group">
            <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">Request a Scan</h3>
            <p className="text-sm text-muted-foreground mt-1">Submit a property for professional 360° scanning</p>
          </a>
          <a href="/agency/leads" className="p-5 rounded-xl border border-border bg-card shadow-card hover:shadow-blue hover:-translate-y-0.5 transition-all group">
            <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">View Leads</h3>
            <p className="text-sm text-muted-foreground mt-1">See inquiries from interested buyers</p>
          </a>
        </div>
      </div>
    </AgencyLayout>
  );
};

export default AgencyOverview;
