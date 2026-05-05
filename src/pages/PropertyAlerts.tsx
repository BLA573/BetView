import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, BellRing, BellOff, MapPin, Loader2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const PropertyAlerts = () => {
  const { user, isPremium } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchAlerts = async () => {
      const { data } = await supabase
        .from('property_alerts')
        .select(`
          id,
          enabled,
          alert_type,
          created_at,
          properties (
            id, title, location, price
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      setAlerts(data || []);
      setLoading(false);
    };
    fetchAlerts();
  }, [user]);

  const toggleAlert = async (id: string, currentEnabled: boolean) => {
    const { error } = await supabase.from('property_alerts').update({ enabled: !currentEnabled }).eq('id', id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, enabled: !currentEnabled } : a));
    }
  };

  const removeAlert = async (id: string) => {
    const { error } = await supabase.from('property_alerts').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Alert removed" });
      setAlerts(prev => prev.filter(a => a.id !== id));
    }
  };

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <Star className="w-12 h-12 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">Premium Feature</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Property price tracking and status alerts are a premium feature. Upgrade your account to receive instant notifications on your favorite listings.
        </p>
        <Link to="/premium" className="px-6 py-3 gradient-blue text-white rounded-xl shadow-blue font-semibold">
          Upgrade to Premium
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-6 md:px-16 py-6 border-b border-border">
        <Link to="/" className="font-display font-semibold text-xl text-foreground tracking-tight">
          BetView
        </Link>
        <Link to="/profile" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Profile
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-foreground mb-2">Property Alerts</h1>
          <p className="text-muted-foreground">Manage notifications for price changes and status updates.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
            <BellRing className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">You haven't set up any property alerts.</p>
            <Link to="/browse" className="text-primary font-medium hover:underline">
              Browse properties to track
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => {
              const p = alert.properties;
              if (!p) return null;
              return (
                <div key={alert.id} className="p-6 bg-card border border-border rounded-xl flex flex-col md:flex-row gap-6 justify-between md:items-center shadow-sm hover:shadow-md transition-all">
                  <div className="flex-1">
                    <Link to={`/browse?property=${p.id}`} className="font-display font-bold text-lg text-foreground hover:text-primary transition-colors block mb-1">
                      {p.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {p.location}</span>
                      <span className="font-medium text-foreground">{p.price}</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-secondary text-xs font-medium text-secondary-foreground">
                      Tracking {alert.alert_type === 'price_change' ? "Price Changes" : "All Updates"}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-border/50">
                    <div className="flex items-center gap-3">
                      <Label htmlFor={`toggle-${alert.id}`} className="text-sm font-medium cursor-pointer">
                        {alert.enabled ? "Active" : "Paused"}
                      </Label>
                      <Switch 
                        id={`toggle-${alert.id}`} 
                        checked={alert.enabled} 
                        onCheckedChange={() => toggleAlert(alert.id, alert.enabled)} 
                      />
                    </div>
                    
                    <button 
                      onClick={() => removeAlert(alert.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-2"
                      title="Delete alert"
                    >
                      <BellOff className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default PropertyAlerts;
