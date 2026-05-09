import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import apartment360 from "@/assets/apartment-360.jpg";

type DemoSource = "auto" | "manual_url" | "property";

const DemoSection = () => {
  const [tourUrl, setTourUrl] = useState<string | null>(null);
  const [showTour, setShowTour] = useState(false);
  const [fallbackMessage, setFallbackMessage] = useState("Drag to explore • Pinch to zoom");

  useEffect(() => {
    const normalizeTourUrl = (candidate: string | null | undefined) => {
      if (!candidate) return null;
      try {
        const parsed = new URL(candidate);
        return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : null;
      } catch {
        return null;
      }
    };

    const fetchFeaturedDemo = async () => {
      const { data: settings } = await supabase
        .from("platform_settings")
        .select("dashboard_demo_tour_url, dashboard_demo_source, featured_property_id")
        .eq("id", 1)
        .maybeSingle();

      const source = (settings?.dashboard_demo_source || "auto") as DemoSource;

      if (source === "manual_url" && settings?.dashboard_demo_tour_url) {
        const manualUrl = normalizeTourUrl(settings.dashboard_demo_tour_url);
        if (manualUrl) {
          setTourUrl(manualUrl);
          setFallbackMessage("Drag to explore • Pinch to zoom");
          return;
        }
      }

      if (source === "property" && settings?.featured_property_id) {
        const { data: featuredProperty } = await supabase
          .from("properties")
          .select("tour_url")
          .eq("id", settings.featured_property_id)
          .maybeSingle();

        const propertyUrl = normalizeTourUrl(featuredProperty?.tour_url);
        if (propertyUrl) {
          setTourUrl(propertyUrl);
          setFallbackMessage("Drag to explore • Pinch to zoom");
          return;
        }
      }

      const { data: autoProperty } = await supabase
        .from("properties")
        .select("tour_url")
        .not("tour_url", "is", null)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const autoUrl = normalizeTourUrl(autoProperty?.tour_url);
      if (autoUrl) {
        setTourUrl(autoUrl);
        setFallbackMessage("Drag to explore • Pinch to zoom");
      } else {
        setTourUrl(null);
        setFallbackMessage("No live demo configured yet");
      }
    };

    fetchFeaturedDemo();
  }, []);

  return (
    <section id="vr-demo" className="py-16 sm:py-24" style={{ background: 'hsl(215,66%,10%)' }}>
      <div className="container max-w-6xl px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase mb-4"
            style={{ background: 'hsl(214,80%,40%,0.15)', color: 'hsl(var(--blue-glow))' }}>
            Live VR Preview
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-white mb-4">
            Step Inside an Addis Ababa Apartment
          </h2>
          <p className="text-white/60 text-base sm:text-lg max-w-xl mx-auto">
            Experience a real Addis Ababa apartment in immersive 3D.
          </p>
        </div>

        {/* 360° Demo Player */}
        <div className="relative rounded-2xl overflow-hidden shadow-hero group" style={{ boxShadow: 'var(--shadow-hero)' }}>
          {showTour && tourUrl ? (
            <iframe
              src={tourUrl}
              title="360° Virtual Tour"
              width="100%"
              allowFullScreen
              allow="autoplay; fullscreen; web-share; xr-spatial-tracking"
              className="w-full"
              style={{ height: 'clamp(240px, 40vw, 480px)', border: 0, display: 'block' }}
            />
          ) : (
            <>
              <img
                src={apartment360}
                alt="360° apartment tour Addis Ababa"
                className="w-full object-cover"
                style={{ height: 'clamp(240px, 40vw, 480px)' }}
              />
              {/* Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ background: 'linear-gradient(to bottom, hsl(215,66%,10%,0.3), hsl(215,66%,10%,0.6))' }}>
                {/* Play button */}
                <button
                  onClick={() => tourUrl && setShowTour(true)}
                  className={`w-20 h-20 rounded-full gradient-blue flex items-center justify-center shadow-blue pulse-blue mb-6 transition-transform ${tourUrl ? 'hover:scale-110 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
                >
                  <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 3l14 9-14 9V3z" />
                  </svg>
                </button>
                <span className="text-white font-display font-semibold text-lg">Launch 360° Virtual Tour</span>
                <span className="text-white/50 text-sm mt-1">{fallbackMessage}</span>
              </div>
            </>
          )}

          {/* Corner badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2 glass rounded-lg px-3 py-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white text-xs font-medium">LIVE DEMO</span>
          </div>
          <div className="absolute top-4 right-4 glass rounded-lg px-3 py-1.5">
            <span className="text-white text-xs font-medium">360° • Addis Ababa</span>
          </div>
        </div>

        {/* Feature chips */}
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mt-6 sm:mt-8">
          {["Full 360° Rotation", "HD Quality", "Room-by-Room Navigation", "Mobile Compatible", "No Headset Required"].map((f) => (
            <span key={f} className="px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium border"
              style={{ borderColor: 'hsl(214,80%,40%,0.3)', color: 'hsl(var(--blue-glow))', background: 'hsl(214,80%,40%,0.08)' }}>
              {f}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
