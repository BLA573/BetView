import { useEffect, useState } from "react";
import AgencyLayout from "@/components/agency/AgencyLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Accepts any valid http/https URL — the live preview thumbnail shows
// whether the image actually loads. No extension restriction needed since
// many valid image URLs (Google Drive, Facebook CDN, Imgur, etc.)
// don't end in .jpg/.png.
const isValidUrl = (url: string): boolean => {
  if (!url.trim()) return true; // empty is fine — field is optional
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const AgencyProfile = () => {
  const { agencyId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    website: "",
    description: "",
    logo_url: "",
  });

  useEffect(() => {
    if (!agencyId) return;
    supabase
      .from("agencies")
      .select("name, phone, email, website, description, logo_url")
      .eq("id", agencyId)
      .single()
      .then(({ data }) => {
        if (data) {
          setFormData({
            name:        data.name        || "",
            phone:       data.phone       || "",
            email:       data.email       || "",
            website:     data.website     || "",
            description: data.description || "",
            logo_url:    data.logo_url    || "",
          });
        }
        setLoading(false);
      });
  }, [agencyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyId) return;

    if (!isValidUrl(formData.logo_url)) {
      toast({ title: "Invalid logo URL", description: "Must start with http:// or https://", variant: "destructive" });
      return;
    }
    if (!isValidUrl(formData.website)) {
      toast({ title: "Invalid website URL", description: "Must start with http:// or https://", variant: "destructive" });
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("agencies")
      .update({
        ...formData,
        logo_url: formData.logo_url.trim() || null,
        website:  formData.website.trim()  || null,
      })
      .eq("id", agencyId);

    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Agency profile updated" });
    }
    setSaving(false);
  };

  return (
    <AgencyLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">Agency Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage public details about your agency</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 rounded-xl border border-border bg-card shadow-card space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Agency Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your Agency Name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Public Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website URL (Optional)</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://youragency.com"
                className={formData.website && !isValidUrl(formData.website) ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {formData.website && !isValidUrl(formData.website) && (
                <p className="text-xs text-destructive">Must start with http:// or https://</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL (Optional)</Label>
              <Input
                id="logoUrl"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://i.imgur.com/yourlogo.png"
                className={formData.logo_url && !isValidUrl(formData.logo_url) ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {formData.logo_url && !isValidUrl(formData.logo_url) && (
                <p className="text-xs text-destructive">Must start with http:// or https://</p>
              )}
              {/* Live preview — hides itself if the image fails to load */}
              {formData.logo_url && isValidUrl(formData.logo_url) && (
                <div className="flex items-center gap-3 mt-2">
                  <img
                    src={formData.logo_url}
                    alt="Logo preview"
                    className="w-12 h-12 rounded-lg object-cover border border-border bg-muted"
                    onError={(e) => {
                      (e.target as HTMLImageElement).parentElement!.style.display = "none";
                    }}
                  />
                  <span className="text-xs text-muted-foreground">Preview — if blank, the URL doesn't point to an image</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Paste any image link — from Imgur, your website, Google Drive, etc.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">About the Agency</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description to show on your listings..."
                rows={4}
              />
            </div>

            <Button type="submit" disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        )}
      </div>
    </AgencyLayout>
  );
};

export default AgencyProfile;
