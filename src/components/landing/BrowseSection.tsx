import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ArrowUpDown, GitCompareArrows, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cities, types, modes, sortOptions, parsePrice, parseSqm, mapDbProperty, type Property } from "@/components/browse/propertyData";
import PropertyCard from "@/components/browse/PropertyCard";
import PropertyModal from "@/components/browse/PropertyModal";
import PropertyMap from "@/components/browse/PropertyMap";
import CompareDrawer from "@/components/browse/CompareDrawer";

const MAX_COMPARE = 3;

const BrowseSection = () => {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [modeFilter, setModeFilter] = useState("All");
  const [selected, setSelected] = useState<Property | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [compareOpen, setCompareOpen] = useState(false);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("betview-favorites");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        setAllProperties(data.map(mapDbProperty));
      }
      setLoading(false);
    };
    fetchProperties();
  }, []);

  const toggleFavorite = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("betview-favorites", JSON.stringify([...next]));
      return next;
    });
  }, []);

  const toggleCompare = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < MAX_COMPARE) next.add(id);
      return next;
    });
  }, []);

  const results = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let list = allProperties.filter((p) => {
      if (cityFilter !== "All" && p.city !== cityFilter) return false;
      if (typeFilter !== "All" && p.type !== typeFilter) return false;
      if (modeFilter !== "All" && p.mode !== modeFilter) return false;
      if (q && !(
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      )) return false;
      return true;
    });
    switch (sortBy) {
      case "price-asc": list = [...list].sort((a, b) => parsePrice(a.price) - parsePrice(b.price)); break;
      case "price-desc": list = [...list].sort((a, b) => parsePrice(b.price) - parsePrice(a.price)); break;
      case "size-desc": list = [...list].sort((a, b) => parseSqm(b.livingSpace) - parseSqm(a.livingSpace)); break;
      case "rooms-desc": list = [...list].sort((a, b) => b.rooms - a.rooms); break;
      case "newest": list = [...list].reverse(); break;
    }
    return list;
  }, [searchQuery, cityFilter, typeFilter, modeFilter, sortBy, allProperties]);

  const compareItems = allProperties.filter((p) => compareIds.has(p.id));

  const handleCardClick = useCallback((p: Property) => {
    setHighlightedId(p.id);
    setSelected(p);
  }, []);

  const handleMarkerClick = useCallback((p: Property) => {
    setHighlightedId(p.id);
    const el = cardRefs.current[p.id];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  return (
    <section id="browse" className="py-20 md:py-28 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 text-xs font-medium tracking-wide uppercase">
            Browse Properties
          </Badge>
          <h2 className="font-display font-bold text-3xl md:text-5xl text-foreground">
            Explore Available{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "var(--gradient-blue)" }}>
              Listings
            </span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Browse curated properties across Addis Ababa. Click any listing to see full details and take a 360° virtual tour.
          </p>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by city, area, street, or property name…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 text-base rounded-xl border-border bg-card shadow-card"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4 p-4 rounded-xl bg-card border border-border shadow-card">
          <FilterGroup label="City" options={cities} value={cityFilter} onChange={setCityFilter} />
          <div className="w-px h-8 bg-border hidden sm:block" />
          <FilterGroup label="Type" options={types} value={typeFilter} onChange={setTypeFilter} />
          <div className="w-px h-8 bg-border hidden sm:block" />
          <FilterGroup label="Rent / Buy" options={modes} value={modeFilter} onChange={setModeFilter} />
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {results.length} {results.length === 1 ? "property" : "properties"} found
          </p>
          <div className="flex items-center gap-3">
            {compareIds.size >= 2 && (
              <button
                onClick={() => setCompareOpen(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium gradient-blue text-primary-foreground shadow-blue hover:opacity-90 transition-all"
              >
                <GitCompareArrows className="w-4 h-4" />
                Compare ({compareIds.size})
              </button>
            )}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm bg-card border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <PropertyMap
            properties={results}
            focusedId={highlightedId}
            onMarkerClick={handleMarkerClick}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : results.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">No properties match your filters.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                isFavorite={favorites.has(p.id)}
                isCompare={compareIds.has(p.id)}
                isHighlighted={highlightedId === p.id}
                onOpen={handleCardClick}
                onToggleFavorite={toggleFavorite}
                onToggleCompare={toggleCompare}
                compareDisabled={compareIds.size >= MAX_COMPARE}
                cardRef={(el) => { cardRefs.current[p.id] = el; }}
              />
            ))}
          </div>
        )}
      </div>

      <PropertyModal
        property={selected}
        onClose={() => setSelected(null)}
        isFavorite={selected ? favorites.has(selected.id) : false}
        onToggleFavorite={toggleFavorite}
      />

      <CompareDrawer
        items={compareItems}
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        onRemove={(id) => {
          setCompareIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            if (next.size < 2) setCompareOpen(false);
            return next;
          });
        }}
      />
    </section>
  );
};

const FilterGroup = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="flex items-center gap-2 flex-wrap">
    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
    {options.map((opt) => (
      <button
        key={opt}
        onClick={() => onChange(opt)}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${value === opt
            ? "gradient-blue text-primary-foreground shadow-blue"
            : "bg-secondary text-secondary-foreground hover:bg-accent/20"
          }`}
      >
        {opt}
      </button>
    ))}
  </div>
);

export default BrowseSection;
