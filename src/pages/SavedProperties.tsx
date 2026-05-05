import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, MapPin, BedDouble, Trash2, Loader2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const SavedProperties = () => {
  const { user, isPremium } = useAuth();
  const { toast } = useToast();
  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchSaved = async () => {
      const { data } = await supabase
        .from('saved_properties')
        .select(`
          id,
          property_id,
          created_at,
          properties (
            id, title, location, price, type, rooms, images, is_verified, is_featured
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      setSaved(data || []);
      setLoading(false);
    };
    fetchSaved();
  }, [user]);

  const handleRemove = async (savedId: string) => {
    const { error } = await supabase.from('saved_properties').delete().eq('id', savedId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Removed from saved properties" });
      setSaved((prev) => prev.filter((item) => item.id !== savedId));
    }
  };

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <Star className="w-12 h-12 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">Premium Feature</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Saving properties for later is a premium feature. Upgrade your account to keep track of your favorite properties.
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
        <Link to="/browse" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Browse
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="font-display font-bold text-3xl text-foreground mb-2">Saved Properties</h1>
        <p className="text-muted-foreground mb-8">Your personal shortlist of properties.</p>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : saved.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
            <p className="text-muted-foreground mb-4">You haven't saved any properties yet.</p>
            <Link to="/browse" className="text-primary font-medium hover:underline">
              Start Browsing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {saved.map((item) => {
              const p = item.properties;
              if (!p) return null;
              return (
                <div key={item.id} className="group relative rounded-2xl border border-border bg-card overflow-hidden shadow-card hover:shadow-blue transition-all duration-300">
                  <button 
                    onClick={() => handleRemove(item.id)}
                    className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/50 hover:bg-red-500/80 backdrop-blur rounded-full flex items-center justify-center transition-colors border border-white/10 text-white"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <Link to={`/browse?property=${p.id}`} className="block h-48 overflow-hidden relative">
                    <img src={p.images?.[0] || "/placeholder.svg"} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {p.is_featured && <Badge className="bg-yellow-500 text-black border-none hover:bg-yellow-400">Featured</Badge>}
                      {p.is_verified && <Badge variant="secondary" className="bg-white/90 text-primary hover:bg-white border-none">Verified</Badge>}
                    </div>
                  </Link>

                  <div className="p-5">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <Link to={`/browse?property=${p.id}`}>
                        <h3 className="font-display font-bold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {p.title}
                        </h3>
                      </Link>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{p.location}</span>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                      <div>
                        <p className="font-display font-bold text-xl text-foreground">
                          {p.price}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground text-sm">
                        <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" /> {p.rooms}</span>
                      </div>
                    </div>
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

export default SavedProperties;
