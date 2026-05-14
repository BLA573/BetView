import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { mapDbProperty, type Property } from "@/components/browse/propertyData";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Heart,
  Home,
  LayoutGrid,
  MapPin,
  Phone,
  Pill,
  Printer,
  Rotate3d,
  Ruler,
  School,
  Share2,
  ShieldAlert,
  ShoppingCart,
  Train,
  Video,
  Maximize2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { sendVisitNotification } from "@/lib/sendVisitNotification";
import ThemeToggle from "@/components/shared/ThemeToggle";

const HERO_IMAGE_COUNT = 13;

type MediaTab = "tour" | "video" | "floor";

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isPremium } = useAuth();
  const { toast } = useToast();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const [mediaTab, setMediaTab] = useState<MediaTab>("tour");
  const [isFavorite, setIsFavorite] = useState(false);
  const [mapZoom, setMapZoom] = useState(15);
  const [measureMode, setMeasureMode] = useState(false);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [agency, setAgency] = useState<{
    name: string;
    logoUrl: string | null;
    phone: string | null;
    address: string | null;
  } | null>(null);
  const [visitForm, setVisitForm] = useState({
    name: "",
    phone: "",
    email: user?.email || "",
    preferredDate: "",
    preferredTime: "",
    message: "",
    consent: false,
  });
  const [submittingVisit, setSubmittingVisit] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const { data, error } = await supabase.from("properties").select("*").eq("id", id).single();
      if (error || !data) {
        setLoading(false);
        return;
      }
      setProperty(mapDbProperty(data));
      if (data.agency_id) {
        const { data: agencyData } = await supabase
          .from("agencies")
          .select("name, logo_url, phone, address")
          .eq("id", data.agency_id)
          .single();
        if (agencyData) {
          setAgency({
            name: agencyData.name,
            logoUrl: agencyData.logo_url ?? null,
            phone: agencyData.phone ?? null,
            address: agencyData.address ?? null,
          });
        } else {
          setAgency(null);
        }
      } else {
        setAgency(null);
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  useEffect(() => {
    if (!user || !isPremium || !id) return;
    supabase
      .from("saved_properties")
      .select("id")
      .eq("user_id", user.id)
      .eq("property_id", id)
      .single()
      .then(({ data }) => {
        if (data) setIsFavorite(true);
      });
  }, [user, isPremium, id]);

  useEffect(() => {
    if (!property) return;
    const fetchSimilar = async () => {
      const { data, error } = await supabase
        .from("properties")
        .select(
          "id, title, description, location, lat, lng, price, base_rent, price_per_sqm, rooms, living_space, property_size, available, type, mode, images, tour_url, surroundings, transport, is_verified, is_featured, created_at",
        )
        .neq("id", property.id)
        .order("created_at", { ascending: false })
        .limit(8);
      if (!error && data) {
        const mapped = data.map(mapDbProperty);
        const filtered = mapped.filter((item) => item.type === property.type || item.city === property.city);
        setSimilarProperties(filtered.slice(0, 4));
      }
    };
    fetchSimilar();
  }, [property]);

  const heroImages = useMemo(() => {
    const base = property?.images?.length ? property.images : ["/placeholder.svg"];
    return Array.from({ length: HERO_IMAGE_COUNT }, (_, i) => base[i % base.length]);
  }, [property?.images]);

  const safeTourUrl = (() => {
    if (!property?.tourUrl) return null;
    try {
      const parsed = new URL(property.tourUrl);
      return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : null;
    } catch {
      return null;
    }
  })();

  const toggleFavorite = async () => {
    if (!user) {
      toast({ title: "Sign in to save properties", variant: "destructive" });
      return;
    }
    if (!isPremium) {
      toast({ title: "Premium required", description: "Upgrade to save properties.", variant: "destructive" });
      return;
    }
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

  const handleCardClick = useCallback(
    (p: Property) => {
      navigate(`/property/${p.id}`);
    },
    [navigate],
  );

  const setVisitField = (key: keyof typeof visitForm, value: string | boolean) => {
    setVisitForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      toast({ title: "Please sign in first", variant: "destructive" });
      return;
    }
    if (!visitForm.consent) {
      toast({ title: "Please consent to contact", variant: "destructive" });
      return;
    }
    if (!property) return;
    setSubmittingVisit(true);
    const { error, data: insertedData } = await supabase.from("visit_requests").insert({
      user_id: user.id,
      property_id: property.id,
      name: visitForm.name.trim(),
      phone: visitForm.phone.trim(),
      email: visitForm.email.trim(),
      preferred_date: visitForm.preferredDate || null,
      preferred_time: visitForm.preferredTime || null,
      message: visitForm.message.trim() || null,
      status: "pending",
    }).select();
    if (error) {
      toast({ title: "Error submitting request", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Visit request submitted!", description: "The agency will contact you to confirm." });
      // Fire-and-forget — email failure must not affect the user experience
      void sendVisitNotification({
        propertyId:      property.id,
        propertyTitle:   property.title,
        visitorName:     visitForm.name.trim(),
        visitorEmail:    visitForm.email.trim(),
        visitorPhone:    visitForm.phone.trim(),
        preferredDate:   visitForm.preferredDate || null,
        preferredTime:   visitForm.preferredTime || null,
        message:         visitForm.message.trim() || null,
        visitRequestId:  insertedData?.[0]?.id ?? "",
      });
      setVisitForm({
        name: "",
        phone: "",
        email: user.email || "",
        preferredDate: "",
        preferredTime: "",
        message: "",
        consent: false,
      });
    }
    setSubmittingVisit(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background page-transition">
        <nav className="flex items-center gap-4 px-6 md:px-16 py-4 border-b border-border">
          <Skeleton className="h-8 w-28" />
        </nav>
        <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
          <Skeleton className="h-80 w-full rounded-2xl" />
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
        <Link to="/browse" className="text-primary hover:underline">
          Back to Browse
        </Link>
      </div>
    );
  }

  const p = property;
  const mapSrc = `https://www.google.com/maps?q=${p.lat},${p.lng}&z=${mapZoom}&output=embed`;

  const specs = [
    { label: "Availability", value: p.available || "Sofort" },
    { label: "Property Type", value: p.type || "Apartment" },
    { label: "Rooms", value: `${p.rooms}` },
    { label: "Bathrooms", value: "1" },
    { label: "Floor", value: "1 of 3" },
    { label: "Living Area", value: p.livingSpace || "64 m²" },
    { label: "Year Built", value: "2025" },
  ];

  const amenities = [
    { label: "Public Transport", value: "4 min (Steg VS station)", icon: <Train className="w-4 h-4" /> },
    { label: "Supermarket", value: "4 min (Migros)", icon: <ShoppingCart className="w-4 h-4" /> },
    { label: "Pharmacy", value: "6 min (Apotheke Oggier)", icon: <Pill className="w-4 h-4" /> },
    { label: "School", value: "2 min (Primarschule Steg)", icon: <School className="w-4 h-4" /> },
    { label: "Train Station", value: "16 min (Gampel-Steg)", icon: <Train className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background page-transition">
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
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-10">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4 lg:sticky lg:top-24">
            <div className="flex flex-wrap items-center gap-2">
              <MediaTabButton
                active={mediaTab === "tour"}
                onClick={() => setMediaTab("tour")}
                icon={<Rotate3d className="w-4 h-4" />}
                label="360° Tour"
              />
              <MediaTabButton
                active={mediaTab === "video"}
                onClick={() => setMediaTab("video")}
                icon={<Video className="w-4 h-4" />}
                label="Video Tour"
              />
              <MediaTabButton
                active={mediaTab === "floor"}
                onClick={() => setMediaTab("floor")}
                icon={<LayoutGrid className="w-4 h-4" />}
                label="Floor Plans"
              />
            </div>

            <div
              className="relative rounded-2xl overflow-hidden h-72 md:h-[420px] bg-muted shadow-card focus:outline-none focus:ring-2 focus:ring-ring"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "ArrowLeft") {
                  setImgIndex((i) => (i - 1 + heroImages.length) % heroImages.length);
                }
                if (event.key === "ArrowRight") {
                  setImgIndex((i) => (i + 1) % heroImages.length);
                }
              }}
              aria-label="Property image gallery"
            >
              <img src={heroImages[imgIndex]} alt={p.title} className="w-full h-full object-cover" />

              <button
                onClick={() => setImgIndex((i) => (i - 1 + heroImages.length) % heroImages.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition shadow"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
              <button
                onClick={() => setImgIndex((i) => (i + 1) % heroImages.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition shadow"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>
              <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-background/80 text-xs font-semibold text-foreground">
                {imgIndex + 1}/{heroImages.length}
              </div>
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <button
                  onClick={toggleFavorite}
                  className={`w-10 h-10 rounded-full backdrop-blur flex items-center justify-center transition ${
                    isFavorite ? "bg-destructive/15 text-destructive" : "bg-background/80 text-foreground hover:bg-background"
                  }`}
                  aria-label={isFavorite ? "Remove from favorites" : "Save property"}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? "fill-destructive" : ""}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition"
                  aria-label="Share property"
                >
                  <Share2 className="w-5 h-5 text-foreground" />
                </button>
                <button
                  onClick={() => window.print()}
                  className="w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition"
                  aria-label="Print listing"
                >
                  <Printer className="w-5 h-5 text-foreground" />
                </button>
              </div>
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge className="bg-primary text-white">{p.mode}</Badge>
                {p.is_featured && <Badge className="bg-yellow-500 text-yellow-950 border-none">Early Access</Badge>}
                {p.is_verified && <Badge className="bg-emerald-500 text-white border-none">Verified</Badge>}
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {heroImages.map((img, i) => (
                <button
                  key={`${img}-${i}`}
                  onClick={() => setImgIndex(i)}
                  className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition ${
                    i === imgIndex ? "border-primary" : "border-transparent opacity-70"
                  }`}
                  aria-label={`Show image ${i + 1}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-border bg-card shadow-card">
              {mediaTab === "tour" && safeTourUrl ? (
                <div className="aspect-video">
                  <iframe
                    src={safeTourUrl}
                    title="360° Virtual Tour"
                    width="100%"
                    height="100%"
                    allowFullScreen
                    allow="autoplay; fullscreen; web-share; xr-spatial-tracking"
                    className="w-full h-full"
                    style={{ border: 0 }}
                  />
                </div>
              ) : mediaTab === "tour" ? (
                <div className="p-6 text-sm text-muted-foreground flex items-center gap-2">
                  <Rotate3d className="w-4 h-4" /> 360° tour coming soon for this listing.
                </div>
              ) : mediaTab === "video" ? (
                <div className="p-6 text-sm text-muted-foreground flex items-center gap-2">
                  <Video className="w-4 h-4" /> Video tour will be available shortly.
                </div>
              ) : (
                <div className="p-6 text-sm text-muted-foreground flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4" /> Floor plans are being prepared.
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-2xl border border-border bg-card shadow-card">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Quick Facts</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <QuickFact icon={<Home className="w-4 h-4" />} label="Type" value={p.type} />
                <QuickFact icon={<BedDouble className="w-4 h-4" />} label="Rooms" value={`${p.rooms}`} />
                <QuickFact icon={<Bath className="w-4 h-4" />} label="Baths" value="1" />
                <QuickFact icon={<Maximize2 className="w-4 h-4" />} label="Living" value={p.livingSpace} />
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-secondary px-4 py-3">
                <span className="text-sm text-muted-foreground">Price</span>
                <span className="font-display font-bold text-lg text-foreground">{p.price}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-card shadow-card">
              <h3 className="font-display font-semibold text-foreground mb-3">Nearby Amenities</h3>
              <div className="space-y-3">
                {amenities.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-primary">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    <span className="font-semibold text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-card shadow-card">
              <h3 className="font-display font-semibold text-foreground mb-2">Price Summary</h3>
              <p className="font-display text-3xl font-bold text-primary">{p.price}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <PriceLine label="Price / m²" value={p.pricePerSqm || "N/A"} />
                <PriceLine label="Base Rent" value={p.baseRent || "Included"} />
                <PriceLine label="Property Size" value={p.propertySize || "N/A"} />
                <PriceLine label="Availability" value={p.available || "Sofort"} />
              </div>
            </div>
          </div>
        </section>

        <section className="sticky top-20 z-40 bg-background/90 backdrop-blur border border-border rounded-2xl shadow-card">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 px-5 py-4">
            <QuickFact icon={<Home className="w-4 h-4" />} label="Type" value={p.type} />
            <QuickFact icon={<BedDouble className="w-4 h-4" />} label="Rooms" value={`${p.rooms}`} />
            <QuickFact icon={<Bath className="w-4 h-4" />} label="Baths" value="1" />
            <QuickFact icon={<Maximize2 className="w-4 h-4" />} label="Living" value={p.livingSpace} />
            <QuickFact icon={<CalendarCheck className="w-4 h-4" />} label="Available" value={p.available} />
            <QuickFact icon={<Ruler className="w-4 h-4" />} label="Price" value={p.price} />
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h1 className="font-display font-bold text-2xl md:text-4xl text-foreground">{p.title}</h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-2">
              <MapPin className="w-4 h-4" />
              <span>{p.location}</span>
            </div>
          </div>
          <div className="max-w-md rounded-2xl border border-border bg-card shadow-card overflow-hidden">
            <div className="flex items-center">
              <div className="w-20 h-20 flex items-center justify-center border-r border-border bg-secondary">
                {agency?.logoUrl ? (
                  <img src={agency.logoUrl} alt={agency.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center font-display text-sm font-semibold text-foreground">
                    {getAgencyInitials(agency?.name || "Agency")}
                  </div>
                )}
              </div>
              <div className="flex-1 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Provider</p>
                <p className="font-display font-semibold text-foreground">{agency?.name || "Agency"}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Location Map
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMapZoom((z) => Math.min(19, z + 1))}
                  className="px-3 py-1.5 rounded-lg border border-border text-sm font-semibold hover:bg-secondary"
                  aria-label="Zoom in"
                >
                  +
                </button>
                <button
                  onClick={() => setMapZoom((z) => Math.max(12, z - 1))}
                  className="px-3 py-1.5 rounded-lg border border-border text-sm font-semibold hover:bg-secondary"
                  aria-label="Zoom out"
                >
                  -
                </button>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-border h-72">
              <iframe
                title="Property Location"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                src={mapSrc}
              />
            </div>

            <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Ruler className="w-4 h-4" />
                <span>Distance measurement</span>
              </div>
              <button
                onClick={() => setMeasureMode((v) => !v)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition ${
                  measureMode ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:bg-secondary"
                }`}
                aria-pressed={measureMode}
              >
                {measureMode ? "On" : "Off"}
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl border border-border bg-card shadow-card">
              <h3 className="font-display font-semibold text-foreground mb-2">Price</h3>
              <p className="font-display text-3xl font-bold text-primary">{p.price}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <PriceLine label="Price / m²" value={p.pricePerSqm || "N/A"} />
                <PriceLine label="Base Rent" value={p.baseRent || "Included"} />
                <PriceLine label="Property Size" value={p.propertySize || "N/A"} />
                <PriceLine label="Availability" value={p.available || "Sofort"} />
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-card shadow-card">
              <h3 className="font-display font-semibold text-foreground mb-2">Main Specifications</h3>
              <div className="grid grid-cols-1 gap-3">
                {specs.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-semibold text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="p-6 rounded-2xl border border-border bg-card shadow-card space-y-4">
          <h2 className="font-display font-bold text-lg text-foreground">Detailed Description</h2>
          <p className="text-muted-foreground leading-relaxed">
            {p.description ||
              "Bright, newly built apartment with a calm balcony view, designed for modern living. The open-plan layout connects living and dining spaces, while large windows bring in abundant natural light throughout the day."}
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The kitchen features sleek cabinetry, premium appliances, and generous storage. The bathroom includes modern fixtures, a walk-in shower, and easy-clean surfaces.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <HighlightChip text="Room-by-room breakdown" />
            <HighlightChip text="Kitchen features" />
            <HighlightChip text="Bathroom details" />
            <HighlightChip text="Flooring information" />
            <HighlightChip text="Natural lighting" />
            <HighlightChip text="Storage & cellar" />
            <HighlightChip text="Parking options" />
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">


          <div className="lg:col-span-7">
            <div className="p-6 rounded-2xl border border-border bg-card shadow-card space-y-4 lg:sticky lg:top-28">
              <h2 className="font-display font-bold text-lg text-foreground">Contact Form</h2>
              {!user ? (
                <p className="text-muted-foreground text-sm">
                  Please <a href="/auth" className="text-primary font-medium hover:underline">sign in</a> to book a visit.
                </p>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input value={visitForm.name} onChange={(e) => setVisitField("name", e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Phone *</Label>
                      <Input value={visitForm.phone} onChange={(e) => setVisitField("phone", e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={visitForm.email}
                        onChange={(e) => setVisitField("email", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Preferred Date</Label>
                      <Input
                        type="date"
                        value={visitForm.preferredDate}
                        onChange={(e) => setVisitField("preferredDate", e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Preferred Time</Label>
                      <Input
                        type="time"
                        value={visitForm.preferredTime}
                        onChange={(e) => setVisitField("preferredTime", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes / Message</Label>
                    <Textarea
                      value={visitForm.message}
                      onChange={(e) => setVisitField("message", e.target.value)}
                      rows={3}
                      placeholder="Any specific questions or requirements?"
                    />
                  </div>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visitForm.consent}
                      onChange={(e) => setVisitField("consent", e.target.checked)}
                      className="mt-1"
                    />
                    <span className="text-sm text-muted-foreground">
                      I consent to being contacted by the agency regarding this visit request. *
                    </span>
                  </label>
                  <button
                    type="submit"
                    disabled={submittingVisit}
                    className="w-full py-3 rounded-xl gradient-blue text-primary-foreground font-semibold shadow-blue hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {submittingVisit ? "Submitting…" : "Submit Visit Request"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-display font-bold text-lg text-foreground">Similar Properties</h2>
          {similarProperties.length === 0 ? (
            <p className="text-sm text-muted-foreground">No similar properties available yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {similarProperties.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleCardClick(item)}
                  className="group rounded-2xl overflow-hidden border border-border bg-card shadow-card hover:shadow-blue transition text-left"
                >
                  <div className="h-40 overflow-hidden">
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{item.location}</p>
                    <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                      <span className="font-semibold text-primary">{item.price}</span>
                      <span className="flex items-center gap-1">
                        <BedDouble className="w-4 h-4" />
                        {item.rooms}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="p-6 rounded-2xl border border-border bg-card shadow-card">
          <div className="flex items-center gap-2 text-foreground">
            <ShieldAlert className="w-5 h-5 text-destructive" />
            <h2 className="font-display font-bold text-lg">Fraud Protection Alert</h2>
          </div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2"><span className="mt-1 w-2 h-2 rounded-full bg-destructive" />Never wire money in advance.</div>
            <div className="flex items-start gap-2"><span className="mt-1 w-2 h-2 rounded-full bg-destructive" />Be cautious of deals too good to be true.</div>
            <div className="flex items-start gap-2"><span className="mt-1 w-2 h-2 rounded-full bg-destructive" />Never share personal data or bank details.</div>
            <div className="flex items-start gap-2"><span className="mt-1 w-2 h-2 rounded-full bg-destructive" />Never sign without viewing the property.</div>
          </div>
        </section>
      </div>
    </div>
  );
};

const MediaTabButton = ({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
      active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-secondary"
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const QuickFact = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center gap-2">
    <div className="text-primary">{icon}</div>
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  </div>
);

const PriceLine = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-muted-foreground uppercase">{label}</p>
    <p className="font-semibold text-foreground">{value}</p>
  </div>
);

const HighlightChip = ({ text }: { text: string }) => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground rounded-lg bg-secondary px-3 py-2">
    <span className="w-2 h-2 rounded-full bg-primary" />
    <span>{text}</span>
  </div>
);

const InfoLine = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-center justify-between gap-3">
    <div className="flex items-center gap-2 text-muted-foreground">
      {icon}
      <span>{label}</span>
    </div>
    <span className="font-semibold text-foreground">{value}</span>
  </div>
);

const getAgencyInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "AG";

export default PropertyDetail;
