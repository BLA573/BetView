import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, BedDouble, Maximize2, DollarSign, Ruler, X } from "lucide-react";
import type { Property } from "./propertyData";

interface CompareDrawerProps {
  items: Property[];
  open: boolean;
  onClose: () => void;
  onRemove: (id: string) => void;
}

const rows: { label: string; icon: React.ReactNode; render: (p: Property) => string }[] = [
  { label: "Price", icon: <DollarSign className="w-4 h-4" />, render: (p) => p.price },
  { label: "Location", icon: <MapPin className="w-4 h-4" />, render: (p) => p.location },
  { label: "Type", icon: null, render: (p) => `${p.type} · ${p.mode}` },
  { label: "Rooms", icon: <BedDouble className="w-4 h-4" />, render: (p) => `${p.rooms}` },
  { label: "Living Space", icon: <Maximize2 className="w-4 h-4" />, render: (p) => p.livingSpace },
  { label: "Property Size", icon: <Ruler className="w-4 h-4" />, render: (p) => p.propertySize },
  { label: "Price / m²", icon: null, render: (p) => p.pricePerSqm },
  { label: "Available", icon: null, render: (p) => p.available },
];

const CompareDrawer = ({ items, open, onClose, onRemove }: CompareDrawerProps) => (
  <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
    <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-0 gap-0">
      <div className="p-6 md:p-8 space-y-6">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-foreground">Compare Properties</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4" style={{ gridTemplateColumns: `8rem repeat(${items.length}, 1fr)` }}>
          <div />
          {items.map((p) => (
            <div key={p.id} className="relative rounded-xl overflow-hidden border border-border">
              <img src={p.images[0]} alt={p.title} className="w-full h-36 object-cover" />
              <button onClick={() => onRemove(p.id)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition">
                <X className="w-4 h-4 text-foreground" />
              </button>
              <div className="p-3">
                <p className="font-display font-semibold text-foreground text-sm leading-tight">{p.title}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border overflow-hidden">
          {rows.map((row, idx) => (
            <div key={row.label} className={`grid items-center gap-4 px-4 py-3 ${idx % 2 === 0 ? "bg-secondary/50" : "bg-card"}`} style={{ gridTemplateColumns: `8rem repeat(${items.length}, 1fr)` }}>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                {row.icon}
                <span>{row.label}</span>
              </div>
              {items.map((p) => (
                <p key={p.id} className="font-display font-semibold text-foreground text-sm">{row.render(p)}</p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

export default CompareDrawer;
