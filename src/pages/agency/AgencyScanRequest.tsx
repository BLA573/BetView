import { useState } from "react";
import AgencyLayout from "@/components/agency/AgencyLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const AgencyScanRequest = () => {
  const { agencyId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    property_type: "house",
    expected_price: "",
    contact_person: "",
    contact_phone: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyId) return;

    setLoading(true);
    // Scan requests are stored in scan_requests where agencies have insert access via RLS.
    const { error } = await supabase.from("scan_requests" as never).insert({
      agency_id: agencyId,
      address: formData.location,
      property_type: formData.property_type,
      contact_person: formData.contact_person,
      contact_phone: formData.contact_phone,
      notes: `Property: ${formData.title}\nExpected price/rent: ${formData.expected_price}${formData.notes ? `\nNotes: ${formData.notes}` : ""}`,
      status: "pending",
    } as never);

    if (error) {
      toast({ title: "Error submitting request", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Scan request submitted", description: "Our team will contact you shortly." });
      setFormData({
        title: "",
        location: "",
        property_type: "house",
        expected_price: "",
        contact_person: "",
        contact_phone: "",
        notes: "",
      });
    }
    setLoading(false);
  };

  return (
    <AgencyLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">Request 360° Scan</h1>
          <p className="text-muted-foreground text-sm mt-1">Submit a property for professional scanning</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 rounded-xl border border-border bg-card shadow-card space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Property Title</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Modern Villa in Bole"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Bole, Addis Ababa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Property Type</Label>
              <Select
                value={formData.property_type}
                onValueChange={(value) => setFormData({ ...formData, property_type: value })}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="house">House / Villa</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Expected Price / Rent</Label>
            <Input
              id="price"
              required
              value={formData.expected_price}
              onChange={(e) => setFormData({ ...formData, expected_price: e.target.value })}
              placeholder="e.g. 50,000 ETB / month"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input
                id="contact_person"
                required
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                placeholder="e.g. Abebe Kebede"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                required
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="e.g. +251 9xx xxx xxx"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Preferred time for scanning, contact person, etc."
              rows={4}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Submitting..." : "Submit Scan Request"}
          </Button>
        </form>
      </div>
    </AgencyLayout>
  );
};

export default AgencyScanRequest;
