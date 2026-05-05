import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { mapDbProperty, type Property } from "@/components/browse/propertyData";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin, BedDouble, Maximize2, Home, CalendarCheck, Phone, Heart,
  Share2, ChevronLeft, ChevronRight, Bus, TreePine, Eye, ArrowLeft
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ContactAgentModal from "@/components/browse/ContactAgentModal";
import BookVisitModal from "@/components/browse/BookVisitModal";
import ThemeToggle from "@/components/shared/ThemeToggle";

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isPremium } = useAuth();
  const { toast } = useToast();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const { data, error } = await supabase.from("properties").select("*").eq("id", id).single();
      if (error || !data) {
        setLoading(false);
        return;
      }
      setProperty(mapDbProperty(data));
      setLoading(false);
    };
    fetch();
  }, [id]);

  useEffect(() => {
    if (!user || !isPremium || !id) return;
    supabase.from("saved_properties").select("id").eq("user_id", user.id).eq("property_id", id).single()
      .then(({ data }) => { if (data) setIsFavorite(true); });
  }, [user, isPremium, id]);

  const toggleFavorite = async () => {
    if (!user) { toast({ title: "Sign in to save properties", variant: "destructive" }); return; }
    if (!isPremium) { toast({ title: "Premium required", description: "Upgrade to save properties.", variant: "destructive" }); return; }
    if (!property) return;
    if (isFavorite) {
      await supabase.from("saved_properties").delete().eq("user_id", user.id).eq("property_id", property.id);
      setIsFavorite(false);
    } else {
      await supabase.from("saved_properties").insert({ user_id: user.id, property_id: property.id });
      setIsFavorite(true);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied!" });
  };

  const safeTourUrl = (() => {
    if (!property?.tourUrl) return null;
    try {
      const parsed = new URL(property.tourUrl);
      return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : null;
    } catch { return null; }
  })();

  if (loading) {
    return (
      <div className="min-h-screen bg-background page-transition">
        <nav className="flex items-center gap-4 px-6 md:px-16 py-4 border-b border-border">
          <Skeleton className="h-8 w-28" />
        </nav>
        <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
          <Skeleton className="h-72 w-full rounded-2xl" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground text-lg">Property not found.</p>
        <Link to="/browse" className="text-primary hover:underline">Back to Browse</Link>
      </div>
    );
  }

  const p = property;

  return (
    <div className="min-h-screen bg-background page-transition">
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-16 py-4 bg-card/80 backdrop-blur-lg border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center shadow-blue">
            <span className="text-primary-foreground font-display font-bold text-sm">B</span>
          </div>
          <span className="font-display font-semibold text-xl text-foreground tracking-tight hidden sm:block">
            BetView <span className="text-accent font-light">ቤት View</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Gallery */}
        <div className="relative rounded-2xl overflow-hidden h-64 md:h-96 bg-muted shadow-card">
          <img src={p.images[imgIndex]} alt={p.title} className="w-full h-full object-cover" />
          {p.images.length > 1 && (
            <>
              <button onClick={() => setImgIndex((i) => (i - 1 + p.images.length) % p.images.length)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition shadow">
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
              <button onClick={() => setImgIndex((i) => (i + 1) % p.images.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition shadow">
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {p.images.map((_, i) => (
                  <button key={i} onClick={() => setImgIndex(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${i === imgIndex ? "bg-white scale-125" : "bg-white/50"}`} />
                ))}
              </div>
            </>
          )}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className="bg-primary text-white">{p.mode}</Badge>
            {p.is_featured && <Badge className="bg-yellow-500 text-yellow-950 border-none">Early Access</Badge>}
            {p.is_verified && <Badge className="bg-emerald-500 text-white border-none">Verified</Badge>}
          </div>
        </div>

        {/* Thumbnails */}
        {p.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {p.images.map((img, i) => (
              <button key={i} onClick={() => setImgIndex(i)} className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition ${i === imgIndex ? "border-primary" : "border-transparent opacity-60"}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl md:text-4xl text-foreground">{p.title}</h1>
            <div className="flex items-center gap-1.5 text-muted-foreground mt-2">
              <MapPin className="w-4 h-4" /><span>{p.location}</span>
            </div>
            <p className="font-display font-bold text-2xl text-primary mt-3">{p.price}</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button onClick={toggleFavorite} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${isFavorite ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-border bg-card text-foreground hover:bg-secondary"}`}>
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-destructive" : ""}`} />
              {isFavorite ? "Saved" : "Save"}
            </button>
            <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-border bg-card text-foreground hover:bg-secondary transition-all">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>

        {/* CTA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={() => setShowContact(true)} className="flex items-center justify-center gap-2 py-4 rounded-xl border border-border bg-card text-foreground font-semibold hover:bg-secondary transition-all">
            <Phone className="w-5 h-5 text-primary" /> Contact Agent
          </button>
          <button onClick={() => setShowBooking(true)} className="flex items-center justify-center gap-2 py-4 rounded-xl gradient-blue text-white font-semibold shadow-blue hover:opacity-90 transition-all">
            <CalendarCheck className="w-5 h-5" /> Book a Visit
          </button>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Type", value: p.type, icon: <Home className="w-4 h-4 text-primary" /> },
            { label: "Rooms", value: `${p.rooms} rooms`, icon: <BedDouble className="w-4 h-4 text-primary" /> },
            { label: "Living Area", value: p.livingSpace, icon: <Maximize2 className="w-4 h-4 text-primary" /> },
            { label: "Available", value: p.available, icon: <CalendarCheck className="w-4 h-4 text-primary" /> },
          ].map((item) => (
            <div key={item.label} className="p-4 rounded-xl bg-secondary flex items-start gap-3">
              <div className="mt-0.5">{item.icon}</div>
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="font-semibold text-foreground text-sm mt-0.5">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Price details */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <InfoBlock label="Price" value={p.price} />
          <InfoBlock label="Price / m²" value={p.pricePerSqm || "N/A"} />
          <InfoBlock label="Property Size" value={p.propertySize} />
          {p.baseRent && <InfoBlock label="Base Rent" value={p.baseRent} />}
        </div>

        {/* Description */}
        {p.description && (
          <div className="p-6 rounded-xl border border-border bg-card">
            <h2 className="font-display font-bold text-lg text-foreground mb-3">Description</h2>
            <p className="text-muted-foreground leading-relaxed">{p.description}</p>
          </div>
        )}

        {/* Virtual Tour */}
        {safeTourUrl ? (
          <div>
            <button onClick={() => setShowTour((v) => !v)} className="w-full py-4 rounded-xl gradient-blue text-primary-foreground font-semibold shadow-blue hover:opacity-90 transition-all flex items-center justify-center gap-2 text-base">
              <Eye className="w-5 h-5" />
              {showTour ? "Hide 360° Virtual Tour" : "Take 360° Virtual Tour"}
            </button>
            {showTour && (
              <div className="mt-4 rounded-xl overflow-hidden border border-border aspect-video">
                <iframe src={safeTourUrl} title="360° Virtual Tour" width="100%" height="100%" allowFullScreen allow="autoplay; fullscreen; web-share; xr-spatial-tracking" className="w-full h-full" style={{ border: 0 }} />
              </div>
            )}
          </div>
        ) : (
          <button disabled className="w-full py-4 rounded-xl gradient-blue text-primary-foreground font-semibold flex items-center justify-center gap-2 text-base opacity-50 cursor-not-allowed">
            <Eye className="w-5 h-5" /> 360° Tour Coming Soon
          </button>
        )}

        {/* Area info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {p.surroundings && (
            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="font-display font-semibold text-foreground mb-2 flex items-center gap-2">
                <TreePine className="w-4 h-4 text-accent" /> Surrounding Area
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{p.surroundings}</p>
            </div>
          )}
          {p.transport && (
            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="font-display font-semibold text-foreground mb-2 flex items-center gap-2">
                <Bus className="w-4 h-4 text-accent" /> Transport
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{p.transport}</p>
            </div>
          )}
        </div>

        {/* Map */}
        <div>
          <h2 className="font-display font-bold text-lg text-foreground mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" /> Location
          </h2>
          <div className="rounded-2xl overflow-hidden border border-border h-72">
            <iframe
              title="Property Location"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${p.lng - 0.01}%2C${p.lat - 0.007}%2C${p.lng + 0.01}%2C${p.lat + 0.007}&layer=mapnik&marker=${p.lat}%2C${p.lng}`}
            />
          </div>
        </div>

        {/* Availability */}
        <div className="p-6 rounded-xl border border-border bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-semibold text-foreground">Availability</h3>
            <p className="text-muted-foreground text-sm mt-1">Available from: <span className="text-foreground font-medium">{p.available}</span></p>
          </div>
          <button onClick={() => setShowBooking(true)} className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-blue text-white font-semibold shadow-blue hover:opacity-90 transition-all">
            <CalendarCheck className="w-4 h-4" /> Book a Visit
          </button>
        </div>
      </div>

      <ContactAgentModal propertyId={p.id} propertyTitle={p.title} open={showContact} onClose={() => setShowContact(false)} />
      <BookVisitModal propertyId={p.id} propertyTitle={p.title} open={showBooking} onClose={() => setShowBooking(false)} />
    </div>
  );
};

const InfoBlock = ({ label, value }: { label: string; value: string }) => (
  <div className="p-4 rounded-xl bg-secondary">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="font-display font-semibold text-foreground mt-0.5">{value}</p>
  </div>
);

export default PropertyDetail;
