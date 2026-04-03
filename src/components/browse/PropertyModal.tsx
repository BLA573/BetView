import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MapPin, ChevronLeft, ChevronRight, Bus, TreePine, Eye, Heart, Phone, CalendarCheck, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ContactAgentModal from "./ContactAgentModal";
import type { Property } from "./propertyData";

interface Props {
  property: Property | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

const PropertyModal = ({ property, onClose, isFavorite, onToggleFavorite }: Props) => {
  const [imgIndex, setImgIndex] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const { toast } = useToast();

  if (!property) return null;
  const p = property;

  const handleShare = () => {
    const url = `${window.location.origin}/browse?property=${p.id}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied!", description: "Property link has been copied to clipboard." });
  };

  return (
    <>
      <Dialog open={!!property} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          <div className="relative h-64 md:h-80 bg-muted">
            <img src={p.images[imgIndex]} alt={p.title} className="w-full h-full object-cover" />
            {p.images.length > 1 && (
              <>
                <button onClick={() => setImgIndex((i) => (i - 1 + p.images.length) % p.images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition">
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>
                <button onClick={() => setImgIndex((i) => (i + 1) % p.images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition">
                  <ChevronRight className="w-5 h-5 text-foreground" />
                </button>
              </>
            )}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {p.images.map((_, i) => (
                <button key={i} onClick={() => setImgIndex(i)} className={`w-2 h-2 rounded-full transition ${i === imgIndex ? "bg-primary" : "bg-background/60"}`} />
              ))}
            </div>
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">{p.mode}</Badge>
            <button onClick={(e) => onToggleFavorite(p.id, e)} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition">
              <Heart className={`w-5 h-5 transition-colors ${isFavorite ? "fill-destructive text-destructive" : "text-foreground"}`} />
            </button>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl md:text-3xl text-foreground">{p.title}</DialogTitle>
              <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
                <MapPin className="w-4 h-4" />
                <span>{p.location}</span>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <ActionButton icon={<Phone className="w-4 h-4" />} label="Contact Agent" onClick={() => setShowContact(true)} />
              <ActionButton icon={<CalendarCheck className="w-4 h-4" />} label="Book Visit" onClick={() => toast({ title: "Visit Booked", description: "We'll confirm your visit date via email." })} />
              <ActionButton
                icon={<Heart className={`w-4 h-4 ${isFavorite ? "fill-destructive text-destructive" : ""}`} />}
                label={isFavorite ? "Saved" : "Save Property"}
                onClick={(e) => onToggleFavorite(p.id, e)}
                active={isFavorite}
              />
              <ActionButton icon={<Share2 className="w-4 h-4" />} label="Share Listing" onClick={handleShare} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoBlock label="Price" value={p.price} />
              {p.baseRent && <InfoBlock label="Base Rent" value={p.baseRent} />}
              <InfoBlock label="Price / m²" value={p.pricePerSqm} />
              <InfoBlock label="Rooms" value={String(p.rooms)} />
              <InfoBlock label="Living Space" value={p.livingSpace} />
              <InfoBlock label="Property Size" value={p.propertySize} />
              <InfoBlock label="Available" value={p.available} />
              <InfoBlock label="Type" value={p.type} />
            </div>

            {p.tourUrl ? (
              <>
                <button onClick={() => setShowTour((v) => !v)} className="w-full py-4 rounded-xl gradient-blue text-primary-foreground font-semibold shadow-blue hover:opacity-90 transition-all flex items-center justify-center gap-2 text-base">
                  <Eye className="w-5 h-5" />
                  {showTour ? "Hide 360° Virtual Tour" : "Take 360° Virtual Tour"}
                </button>
                {showTour && (
                  <div className="rounded-xl overflow-hidden border border-border aspect-video">
                    <iframe src={p.tourUrl} title="360° Virtual Tour" width="100%" height="100%" allowFullScreen allow="autoplay; fullscreen; web-share; xr-spatial-tracking" className="w-full h-full" style={{ border: 0 }} />
                  </div>
                )}
              </>
            ) : (
              <button className="w-full py-4 rounded-xl gradient-blue text-primary-foreground font-semibold shadow-blue hover:opacity-90 transition-all flex items-center justify-center gap-2 text-base opacity-60 cursor-not-allowed">
                <Eye className="w-5 h-5" />
                360° Tour Coming Soon
              </button>
            )}

            {p.description && (
              <div>
                <h4 className="font-display font-semibold text-foreground mb-2">Property Description</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{p.description}</p>
              </div>
            )}
            {p.surroundings && (
              <div>
                <h4 className="font-display font-semibold text-foreground mb-2 flex items-center gap-2">
                  <TreePine className="w-4 h-4 text-accent" /> Surrounding Area
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{p.surroundings}</p>
              </div>
            )}
            {p.transport && (
              <div>
                <h4 className="font-display font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Bus className="w-4 h-4 text-accent" /> Transport
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{p.transport}</p>
              </div>
            )}

            <div className="rounded-xl overflow-hidden border border-border h-52 md:h-64">
              <iframe
                title="Property Location"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${p.lng - 0.008}%2C${p.lat - 0.005}%2C${p.lng + 0.008}%2C${p.lat + 0.005}&layer=mapnik&marker=${p.lat}%2C${p.lng}`}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ContactAgentModal
        propertyId={p.id}
        propertyTitle={p.title}
        open={showContact}
        onClose={() => setShowContact(false)}
      />
    </>
  );
};

const ActionButton = ({ icon, label, onClick, active }: { icon: React.ReactNode; label: string; onClick: (e: React.MouseEvent) => void; active?: boolean }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
      active ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-border bg-card text-foreground hover:bg-secondary hover:shadow-card"
    }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const InfoBlock = ({ label, value }: { label: string; value: string }) => (
  <div className="p-3 rounded-lg bg-secondary">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="font-display font-semibold text-foreground text-sm mt-0.5">{value}</p>
  </div>
);

export default PropertyModal;
