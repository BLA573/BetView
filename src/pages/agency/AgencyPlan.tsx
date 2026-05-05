import { useEffect, useState } from "react";
import AgencyLayout from "@/components/agency/AgencyLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Star, Rocket, Check, Mail } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

interface AgencyData {
  plan_tier: "basic" | "pro" | "enterprise";
  listings_count: number;
}

const planDetails = {
  basic: {
    icon: Building2,
    name: "Basic",
    limit: 5,
    features: ["Up to 5 active listings", "Lead notifications", "Request property scans"],
  },
  pro: {
    icon: Star,
    name: "Pro",
    limit: 15,
    features: ["Up to 15 active listings", "Priority routing", "Agency profile badge"],
  },
  enterprise: {
    icon: Rocket,
    name: "Enterprise",
    limit: 1000,
    features: ["Unlimited listings", "Dedicated account manager", "Custom analytics"],
  },
};

const AgencyPlan = () => {
  const { agencyId } = useAuth();
  const [data, setData] = useState<AgencyData | null>(null);

  useEffect(() => {
    if (!agencyId) return;
    const fetchData = async () => {
      const [agencyRes, listingsRes] = await Promise.all([
        supabase.from("agencies").select("plan_tier").eq("id", agencyId).single(),
        supabase.from("properties").select("id", { count: "exact", head: true }).eq("agency_id", agencyId),
      ]);
      setData({
        plan_tier: (agencyRes.data?.plan_tier as "basic" | "pro" | "enterprise") || "basic",
        listings_count: listingsRes.count || 0,
      });
    };
    fetchData();
  }, [agencyId]);

  return (
    <AgencyLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">My Plan</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your agency subscription</p>
        </div>

        {!data ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        ) : (
          <>
            {/* Current Plan Card */}
            <div className="p-8 rounded-xl border-2 border-primary bg-primary/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                {data.plan_tier === "basic" ? <Building2 className="w-32 h-32" /> : data.plan_tier === "pro" ? <Star className="w-32 h-32" /> : <Rocket className="w-32 h-32" />}
              </div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-muted-foreground text-sm font-medium mb-1">Current Plan</h2>
                  <h3 className="font-display font-bold text-4xl text-foreground capitalize mb-2">{data.plan_tier}</h3>
                  <p className="text-sm text-muted-foreground">
                    {data.listings_count} of {planDetails[data.plan_tier].limit} listings used
                  </p>
                </div>
                <div>
                  <a
                    // href="mailto:info@betview.et?subject=Plan%20Upgrade%20Request"
                    href={`/pricing`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-blue text-white shadow-blue hover:opacity-90 transition-all font-semibold"
                  >
                    <Link to="/pricing" className="w-4 h-4" /> Request Upgrade
                  </a>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl border border-border bg-card">
                <h4 className="font-semibold text-foreground mb-4">Current Features</h4>
                <ul className="space-y-3">
                  {planDetails[data.plan_tier].features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6 rounded-xl border border-border bg-card">
                <h4 className="font-semibold text-foreground mb-4">Need more listings?</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  If you're reaching your limit, reach out to our team to upgrade your plan. BetView team will handle all scans and listings for you.
                </p>
                <a href="tel:+251123456789" className="text-primary text-sm font-semibold hover:underline">
                  Call Support
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </AgencyLayout>
  );
};

export default AgencyPlan;
