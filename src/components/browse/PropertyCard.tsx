import { Badge } from "@/components/ui/badge";
import { MapPin, Home, BedDouble, Maximize2, Heart, GitCompareArrows } from "lucide-react";
import type { Property } from "./propertyData";

interface PropertyCardProps {
  property: Property;
  isFavorite: boolean;
  isCompare: boolean;
  isHighlighted: boolean;
  onOpen: (p: Property) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onToggleCompare: (id: string, e: React.MouseEvent) => void;
  compareDisabled: boolean;
  cardRef?: React.Ref<HTMLButtonElement>;
}

const PropertyCard = ({
  property: p,
  isFavorite,
  isCompare,
  isHighlighted,
  onOpen,
  onToggleFavorite,
  onToggleCompare,
  compareDisabled,
  cardRef,
}: PropertyCardProps) => (
  <button
    ref={cardRef}
    onClick={() => onOpen(p)}
    className={`group text-left rounded-xl overflow-hidden border bg-card shadow-card hover:shadow-blue transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-ring ${
      isHighlighted ? "border-primary ring-2 ring-primary/30 shadow-blue" : "border-border"
    } ${isCompare ? "ring-2 ring-accent/50" : ""}`}
  >
    <div className="relative h-52 overflow-hidden">
      <img
        src={p.images[0]}
        alt={p.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs">{p.mode}</Badge>
      <button
        onClick={(e) => onToggleFavorite(p.id, e)}
        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart className={`w-4 h-4 transition-colors ${isFavorite ? "fill-destructive text-destructive" : "text-foreground"}`} />
      </button>
      <button
        onClick={(e) => onToggleCompare(p.id, e)}
        disabled={compareDisabled && !isCompare}
        className={`absolute bottom-3 right-3 px-2.5 py-1.5 rounded-lg text-xs font-medium backdrop-blur flex items-center gap-1 transition-all ${
          isCompare
            ? "bg-accent text-accent-foreground"
            : compareDisabled
            ? "bg-background/50 text-muted-foreground cursor-not-allowed"
            : "bg-background/80 text-foreground hover:bg-background"
        }`}
        aria-label="Toggle compare"
      >
        <GitCompareArrows className="w-3.5 h-3.5" />
        {isCompare ? "Added" : "Compare"}
      </button>
    </div>
    <div className="p-5">
      <p className="font-display font-bold text-lg text-foreground">{p.price}</p>
      <h3 className="font-display font-semibold text-foreground mt-1">{p.title}</h3>
      <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-2">
        <MapPin className="w-3.5 h-3.5" />
        <span>{p.location}</span>
      </div>
      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1"><Home className="w-3.5 h-3.5" />{p.type}</span>
        <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" />{p.rooms} rooms</span>
        <span className="flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5" />{p.livingSpace}</span>
      </div>
      {p.highlight && <p className="mt-3 text-xs text-accent font-medium">{p.highlight}</p>}
    </div>
  </button>
);

export default PropertyCard;
