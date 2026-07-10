import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, MessageSquare, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type SavedItem = {
  id: string;
  property_id: string;
  created_at: string;
  properties: {
    id: string;
    title: string;
    location: string;
    price: string;
    images: string[];
    is_verified: boolean;
    is_featured: boolean;
  } | null;
};

type InquiryItem = {
  id: string;
  property_id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string;
  properties: {
    id: string;
    title: string;
    location: string;
    price: string;
    images: string[];
  } | null;
};

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"saved" | "inquiries">("saved");
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      const [{ data: profileData }, { data: savedData, error: savedError }, { data: inquiryData, error: inquiryError }] = await Promise.all([
        supabase.from("profiles").select("display_name").eq("user_id", user.id).single(),
        supabase
          .from("saved_properties")
          .select(`id, property_id, created_at, properties ( id, title, location, price, images, is_verified, is_featured )`)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("inquiries")
          .select(`id, property_id, name, email, phone, message, created_at, properties ( id, title, location, price, images )`)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      setDisplayName(profileData?.display_name ?? null);

      if (savedError) {
        toast({ title: "Failed to load saved items", description: savedError.message, variant: "destructive" });
      }
      if (inquiryError) {
        toast({ title: "Failed to load inquiries", description: inquiryError.message, variant: "destructive" });
      }

      setSaved((savedData as SavedItem[]) || []);
      setInquiries((inquiryData as InquiryItem[]) || []);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const handleRemoveSaved = async (savedId: string) => {
    setRemovingId(savedId);
    const { error } = await supabase.from("saved_properties").delete().eq("id", savedId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSaved((prev) => prev.filter((item) => item.id !== savedId));
      toast({ title: "Removed from saved" });
    }
    setRemovingId(null);
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
          <img
            src="/betview_logo_primary.png"
            alt="BetView Logo"
            className="h-8 w-auto object-contain"
          />
          <span className="font-display font-semibold text-xl text-foreground tracking-tight">
            BetView
          </span>
        </Link>
        <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-muted flex items-center justify-center border border-border shadow-sm">
              <User className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground leading-none">
                {displayName || user?.email?.split("@")[0] || "My Account"}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1">{user?.email}</p>
            </div>
          </div>

          <Button variant="outline" className="w-fit rounded-xl px-5 py-3 bg-white shadow-sm" onClick={() => { void supabase.auth.signOut(); }}>
            <ArrowLeft className="w-4 h-4 rotate-180" /> Sign out
          </Button>
        </div>

        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab("saved")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${activeTab === "saved"
                ? "bg-background border-border shadow-sm text-foreground"
                : "bg-muted/60 border-transparent text-muted-foreground"
              }`}
          >
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-current">♡</span>
            Saved ({saved.length})
          </button>
          <button
            onClick={() => setActiveTab("inquiries")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${activeTab === "inquiries"
                ? "bg-background border-border shadow-sm text-foreground"
                : "bg-muted/60 border-transparent text-muted-foreground"
              }`}
          >
            <MessageSquare className="w-4 h-4" />
            Inquiries ({inquiries.length})
          </button>
        </div>

        {activeTab === "saved" ? (
          saved.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl bg-card/40">
              <p className="text-muted-foreground mb-4">You haven't saved any properties yet.</p>
              <Link to="/browse" className="text-primary font-medium hover:underline">
                Start Browsing
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {saved.map((item) => {
                const property = item.properties;
                if (!property) return null;
                return (
                  <div key={item.id} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_4px_rgba(15,23,42,0.08)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.10)] transition-all">
                    <Link to={`/browse?property=${property.id}`} className="block relative h-48 bg-muted overflow-hidden">
                      <img
                        src={property.images?.[0] || "/placeholder.svg"}
                        alt={property.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {property.is_featured && <Badge className="bg-yellow-500 text-black border-none hover:bg-yellow-400">Featured</Badge>}
                        {property.is_verified && <Badge variant="secondary" className="bg-white/90 text-primary hover:bg-white border-none">Verified</Badge>}
                      </div>
                    </Link>

                    <div className="p-4 md:p-5">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div>
                          <p className="font-display font-bold text-lg text-foreground leading-tight">{property.price}</p>
                          <Link to={`/browse?property=${property.id}`}>
                            <h3 className="mt-1 font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                              {property.title}
                            </h3>
                          </Link>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 truncate">{property.location}</p>

                      <button
                        onClick={() => void handleRemoveSaved(item.id)}
                        disabled={removingId === item.id}
                        className="mt-4 text-sm font-medium text-red-500 hover:text-red-600 disabled:opacity-50"
                      >
                        {removingId === item.id ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : inquiries.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl bg-card/40">
            <p className="text-muted-foreground mb-4">You haven't sent any inquiries yet.</p>
            <Link to="/browse" className="text-primary font-medium hover:underline">
              Browse properties
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {inquiries.map((inquiry) => {
              const property = inquiry.properties;
              return (
                <div key={inquiry.id} className="p-4 md:p-5 rounded-2xl border border-border bg-card shadow-[0_1px_4px_rgba(15,23,42,0.08)]">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Inquiry</p>
                      <h3 className="font-display font-bold text-xl text-foreground mt-1">{property?.title || "Property inquiry"}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{property?.location || ""}</p>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-nowrap">{new Date(inquiry.created_at).toLocaleDateString()}</p>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4 items-start">
                    <div className="w-full h-24 rounded-xl overflow-hidden bg-muted border border-border">
                      <img
                        src={property?.images?.[0] || "/placeholder.svg"}
                        alt={property?.title || "Inquiry property"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{inquiry.name}</span>
                        <span>•</span>
                        <span>{inquiry.email}</span>
                        {inquiry.phone && <><span>•</span><span>{inquiry.phone}</span></>}
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{inquiry.message}</p>
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

export default Profile;
