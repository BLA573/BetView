import { useEffect, useState } from "react";
import AgencyLayout from "@/components/agency/AgencyLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const AgencyFeatured = () => {
  const { user, agencyId } = useAuth();
  const { toast } = useToast();
  const [featuredRequests, setFeaturedRequests] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);

  // Form states
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [duration, setDuration] = useState<7 | 14 | 30>(7);
  const [submitting, setSubmitting] = useState(false);

  const DURATION_PRICES = {
    7: 1000,
    14: 1800,
    30: 3000
  };

  const fetchData = async () => {
    if (!agencyId) return;
    setLoading(true);

    const [featRes, propRes] = await Promise.all([
      supabase.from("featured_listings").select("*, properties(title)").eq("agency_id", agencyId).order("created_at", { ascending: false }),
      supabase.from("properties").select("id, title, is_featured").eq("agency_id", agencyId)
    ]);

    setFeaturedRequests(featRes.data || []);
    setProperties(propRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [agencyId]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPropertyId) return toast({ title: "Please select a property", variant: "destructive" });
    
    setSubmitting(true);
    const price = DURATION_PRICES[duration];

    const { error } = await supabase.from("featured_listings").insert({
      agency_id: agencyId!,
      property_id: selectedPropertyId,
      duration_days: duration,
      price: price,
      status: "pending"
    });

    if (error) {
      toast({ title: "Error submitting request", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Request submitted", description: "Our team will review your request shortly." });
      setShowRequestForm(false);
      fetchData(); // reload
    }
    setSubmitting(false);
  };

  return (
    <AgencyLayout>
      <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-2xl text-foreground flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" /> Featured Listings
              </h1>
              <p className="text-muted-foreground text-sm mt-1">Boost your properties to the top of search results.</p>
            </div>
            {!showRequestForm && (
              <Button onClick={() => setShowRequestForm(true)} className="gradient-blue text-white shadow-blue">
                <Plus className="w-4 h-4 mr-2" /> Request Featured Placement
              </Button>
            )}
          </div>

          {showRequestForm && (
            <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Request New Placement</h2>
              <form onSubmit={handleSubmitRequest} className="space-y-4 max-w-xl">
                <div>
                  <label className="text-sm font-medium">Select Property</label>
                  <select 
                    className="w-full mt-1.5 h-10 px-3 rounded-lg border border-input bg-background"
                    value={selectedPropertyId}
                    onChange={e => setSelectedPropertyId(e.target.value)}
                    required
                  >
                    <option value="" disabled>-- Select a property --</option>
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.title} {p.is_featured ? '(Already Featured)' : ''}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Placement Duration</label>
                  <div className="grid grid-cols-3 gap-3 mt-1.5">
                    {[7, 14, 30].map(days => (
                      <div 
                        key={days} 
                        onClick={() => setDuration(days as any)}
                        className={`border rounded-lg p-3 text-center cursor-pointer transition-all ${duration === days ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}
                      >
                        <div className="font-bold">{days} Days</div>
                        <div className="text-xs text-muted-foreground">{DURATION_PRICES[days as 7|14|30].toLocaleString()} ETB</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <Button type="submit" disabled={submitting} className="gradient-blue shadow-blue">
                    {submitting ? "Submitting..." : "Submit Request"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowRequestForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Duration / Price</TableHead>
                  <TableHead>Date Requested</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : featuredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      No featured placement requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  featuredRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">
                        {req.properties?.title || "Unknown Property"}
                      </TableCell>
                      <TableCell>
                        <div>{req.duration_days} Days</div>
                        <div className="text-xs text-muted-foreground">{Number(req.price).toLocaleString()} ETB</div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(req.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          req.status === 'pending' ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" :
                          req.status === 'active' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                          req.status === 'expired' ? "bg-muted text-muted-foreground border-border" :
                          "bg-red-500/10 text-red-600 border-red-500/20"
                        }>
                          {req.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
      </div>
    </AgencyLayout>
  );
};

export default AgencyFeatured;
