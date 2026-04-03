import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X } from "lucide-react";

interface Props {
  propertyId: string | null;
  onClose: () => void;
  onSaved: () => void;
}

const MODES = ["Rent", "Buy"] as const;
const TYPES = ["Villa", "Apartment", "Penthouse", "Studio", "House", "Duplex", "Commercial"];

type PropertyFormState = {
  title: string;
  description: string;
  location: string;
  lat: number;
  lng: number;
  price: string;
  base_rent: string;
  price_per_sqm: string;
  rooms: number;
  living_space: string;
  property_size: string;
  available: string;
  type: string;
  mode: string;
  images: string[];
  tour_url: string;
  surroundings: string;
  transport: string;
};

const PropertyFormModal = ({ propertyId, onClose, onSaved }: Props) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<PropertyFormState>({
    title: "",
    description: "",
    location: "",
    lat: 9.015,
    lng: 38.775,
    price: "",
    base_rent: "",
    price_per_sqm: "",
    rooms: 1,
    living_space: "",
    property_size: "",
    available: "Now",
    type: "Apartment",
    mode: "Rent",
    images: [] as string[],
    tour_url: "",
    surroundings: "",
    transport: "",
  });

  useEffect(() => {
    if (propertyId) {
      supabase
        .from("properties")
        .select("*")
        .eq("id", propertyId)
        .single()
        .then(({ data, error }) => {
          if (data && !error) {
            setForm({
              title: data.title,
              description: data.description || "",
              location: data.location || "",
              lat: data.lat,
              lng: data.lng,
              price: data.price,
              base_rent: data.base_rent || "",
              price_per_sqm: data.price_per_sqm || "",
              rooms: data.rooms,
              living_space: data.living_space || "",
              property_size: data.property_size || "",
              available: data.available,
              type: data.type,
              mode: data.mode,
              images: data.images || [],
              tour_url: data.tour_url || "",
              surroundings: data.surroundings || "",
              transport: data.transport || "",
            });
          }
        });
    }
  }, [propertyId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("property-images").upload(path, file);
      if (error) {
        toast({ title: "Upload failed", description: error.message, variant: "destructive" });
        continue;
      }
      const { data: urlData } = supabase.storage.from("property-images").getPublicUrl(path);
      newUrls.push(urlData.publicUrl);
    }
    setForm((f) => ({ ...f, images: [...f.images, ...newUrls] }));
    setUploading(false);
  };

  const removeImage = (idx: number) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.price.trim()) {
      toast({ title: "Title and price are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      base_rent: form.base_rent || null,
      price_per_sqm: form.price_per_sqm || null,
      tour_url: form.tour_url || null,
      surroundings: form.surroundings || null,
      transport: form.transport || null,
      living_space: form.living_space || null,
      property_size: form.property_size || null,
    };

    let error;
    if (propertyId) {
      ({ error } = await supabase.from("properties").update(payload).eq("id", propertyId));
    } else {
      ({ error } = await supabase.from("properties").insert(payload));
    }

    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      toast({ title: propertyId ? "Property updated" : "Property created" });
      onSaved();
    }
    setSaving(false);
  };

  const set = <K extends keyof PropertyFormState>(key: K, value: PropertyFormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{propertyId ? "Edit Property" : "Add Property"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Price *</Label>
              <Input value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="ETB 12,000/mo" required />
            </div>
            <div className="space-y-2">
              <Label>Base Rent</Label>
              <Input value={form.base_rent} onChange={(e) => set("base_rent", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Mode</Label>
              <select value={form.mode} onChange={(e) => set("mode", e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {MODES.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Rooms</Label>
              <Input type="number" min={1} value={form.rooms} onChange={(e) => set("rooms", parseInt(e.target.value) || 1)} />
            </div>
            <div className="space-y-2">
              <Label>Price / m²</Label>
              <Input value={form.price_per_sqm} onChange={(e) => set("price_per_sqm", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Living Space</Label>
              <Input value={form.living_space} onChange={(e) => set("living_space", e.target.value)} placeholder="90 m²" />
            </div>
            <div className="space-y-2">
              <Label>Property Size</Label>
              <Input value={form.property_size} onChange={(e) => set("property_size", e.target.value)} placeholder="120 m²" />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Bole, Addis Ababa" />
            </div>
            <div className="space-y-2">
              <Label>Available</Label>
              <Input value={form.available} onChange={(e) => set("available", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Latitude</Label>
              <Input type="number" step="any" value={form.lat} onChange={(e) => set("lat", parseFloat(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label>Longitude</Label>
              <Input type="number" step="any" value={form.lng} onChange={(e) => set("lng", parseFloat(e.target.value) || 0)} />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>360° Tour URL</Label>
              <Input value={form.tour_url} onChange={(e) => set("tour_url", e.target.value)} placeholder="https://my.matterport.com/show/?m=..." />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Surroundings</Label>
            <Textarea value={form.surroundings} onChange={(e) => set("surroundings", e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Transport</Label>
            <Textarea value={form.transport} onChange={(e) => set("transport", e.target.value)} rows={2} />
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label>Images</Label>
            <div className="flex flex-wrap gap-2">
              {form.images.map((url, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-secondary/50 transition-colors">
                {uploading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : <Upload className="w-5 h-5 text-muted-foreground" />}
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-secondary transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl gradient-blue text-primary-foreground font-semibold shadow-blue hover:opacity-90 transition-all disabled:opacity-50">
              {saving ? "Saving…" : propertyId ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyFormModal;
