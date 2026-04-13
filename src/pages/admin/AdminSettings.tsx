import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Shield, Bell, Palette, LayoutDashboard, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminSettings = () => {
  const { toast } = useToast();
  const [dashboardDemoTourUrl, setDashboardDemoTourUrl] = useState("");
  const [dashboardDemoSource, setDashboardDemoSource] = useState<"auto" | "manual_url" | "property">("auto");
  const [featuredPropertyId, setFeaturedPropertyId] = useState("");
  const [featuredProperties, setFeaturedProperties] = useState<{ id: string; title: string }[]>([]);
  const [savingDemoUrl, setSavingDemoUrl] = useState(false);
  const [demoUrlError, setDemoUrlError] = useState("");

  const isValidHttpUrl = (value: string) => {
    if (!value.trim()) return false;
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const fetchDashboardDemoUrl = async () => {
      const [{ data, error }, { data: properties }] = await Promise.all([
        supabase
          .from("platform_settings")
          .select("dashboard_demo_tour_url, dashboard_demo_source, featured_property_id")
          .eq("id", 1)
          .maybeSingle(),
        supabase.from("properties").select("id, title").order("created_at", { ascending: false }).limit(25),
      ]);

      if (!error && data) {
        setDashboardDemoTourUrl(data.dashboard_demo_tour_url || "");
        setDashboardDemoSource((data.dashboard_demo_source || "auto") as "auto" | "manual_url" | "property");
        setFeaturedPropertyId(data.featured_property_id || "");
      }

      setFeaturedProperties((properties as { id: string; title: string }[]) || []);
    };

    fetchDashboardDemoUrl();
  }, []);

  const saveDashboardDemoUrl = async () => {
    if (dashboardDemoSource === "manual_url" && !isValidHttpUrl(dashboardDemoTourUrl)) {
      setDemoUrlError("Enter a valid http or https URL.");
      toast({ title: "Invalid URL", description: "Enter a valid http or https URL for the demo.", variant: "destructive" });
      return;
    }

    if (dashboardDemoSource === "property" && !featuredPropertyId) {
      setDemoUrlError("Pick a featured property for the selected demo source.");
      toast({ title: "Featured property required", description: "Select a property when using the property source.", variant: "destructive" });
      return;
    }

    setSavingDemoUrl(true);
    const payload = {
      id: 1,
      dashboard_demo_tour_url: dashboardDemoSource === "manual_url" ? (dashboardDemoTourUrl.trim() || null) : null,
      dashboard_demo_source: dashboardDemoSource,
      featured_property_id: featuredPropertyId || null,
    };

    const { error } = await supabase
      .from("platform_settings")
      .upsert(payload, { onConflict: "id" });

    if (error) {
      toast({ title: "Error saving demo URL", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Dashboard demo URL updated" });
      setDemoUrlError("");
    }
    setSavingDemoUrl(false);
  };

  const resetDashboardDemo = async () => {
    setSavingDemoUrl(true);
    const payload = {
      id: 1,
      dashboard_demo_tour_url: null,
      dashboard_demo_source: "auto",
      featured_property_id: null,
    };

    const { error } = await supabase
      .from("platform_settings")
      .upsert(payload, { onConflict: "id" });

    if (error) {
      toast({ title: "Error resetting demo settings", description: error.message, variant: "destructive" });
    } else {
      setDashboardDemoTourUrl("");
      setDashboardDemoSource("auto");
      setFeaturedPropertyId("");
      setDemoUrlError("");
      toast({ title: "Dashboard demo reset to default" });
    }
    setSavingDemoUrl(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Platform configuration</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="p-6 rounded-xl border border-border bg-card shadow-card space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">Security</h3>
                <p className="text-xs text-muted-foreground">Manage auth and access policies</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Role-based access control is active. Manage user roles from the Users page.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card shadow-card space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">Notifications</h3>
                <p className="text-xs text-muted-foreground">Configure alerts and email settings</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Notification preferences can be configured per admin user.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card shadow-card space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Palette className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">Appearance</h3>
                <p className="text-xs text-muted-foreground">Branding and theme settings</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Customize the platform's look and feel from here.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card shadow-card space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">Dashboard 360 Demo</h3>
                <p className="text-xs text-muted-foreground">Control the featured demo source and URL</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Choose an automatic property, a specific listing, or a manual URL for the large dashboard demo.
            </p>
            <div className="space-y-3 pt-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Dashboard 360 Demo Source</p>
              <Select value={dashboardDemoSource} onValueChange={(value) => setDashboardDemoSource(value as "auto" | "manual_url" | "property")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select demo source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto: newest listing with tour URL</SelectItem>
                  <SelectItem value="manual_url">Manual URL</SelectItem>
                  <SelectItem value="property">Selected property</SelectItem>
                </SelectContent>
              </Select>

              {dashboardDemoSource === "property" && (
                <Select value={featuredPropertyId} onValueChange={setFeaturedPropertyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pick a featured property" />
                  </SelectTrigger>
                  <SelectContent>
                    {featuredProperties.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <p className="text-xs text-muted-foreground uppercase tracking-wide">Dashboard 360 Demo URL</p>
              <Input
                value={dashboardDemoTourUrl}
                onChange={(e) => {
                  setDashboardDemoTourUrl(e.target.value);
                  setDemoUrlError("");
                }}
                placeholder="https://tour.panoee.net/your-demo"
                className={demoUrlError ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {demoUrlError && <p className="text-xs text-red-500">{demoUrlError}</p>}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={saveDashboardDemoUrl}
                  disabled={savingDemoUrl}
                  className="px-4 py-2 rounded-lg gradient-blue text-primary-foreground text-sm font-medium shadow-blue hover:opacity-90 transition-all disabled:opacity-60"
                >
                  {savingDemoUrl ? "Saving..." : "Save Demo URL"}
                </button>
                <button
                  type="button"
                  onClick={resetDashboardDemo}
                  disabled={savingDemoUrl}
                  className="px-4 py-2 rounded-lg border border-border bg-secondary/40 text-foreground text-sm font-medium hover:bg-secondary transition-all disabled:opacity-60 inline-flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset to Default
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
