-- Phase 4 migration for Featured Listings

CREATE TABLE featured_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
    duration_days INT CHECK (duration_days IN (7, 14, 30)),
    price NUMERIC NOT NULL,
    status TEXT CHECK (status IN ('pending', 'active', 'expired', 'rejected')) DEFAULT 'pending',
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE featured_listings ENABLE ROW LEVEL SECURITY;

-- Agency can view their own requests and insert
CREATE POLICY "Agencies can view their own featured listings requests"
    ON featured_listings FOR SELECT
    USING (agency_id = (SELECT agency_id FROM agency_members WHERE user_id = auth.uid() LIMIT 1));

CREATE POLICY "Agencies can request featured listings"
    ON featured_listings FOR INSERT
    WITH CHECK (agency_id = (SELECT agency_id FROM agency_members WHERE user_id = auth.uid() LIMIT 1));

-- Trigger to sync properties.is_featured with featured_listings.status
CREATE OR REPLACE FUNCTION sync_featured_property()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.status = 'active' AND NEW.start_date <= NOW() AND NEW.end_date >= NOW() THEN
      UPDATE properties SET is_featured = true WHERE id = NEW.property_id;
    ELSIF NEW.status = 'expired' THEN
      UPDATE properties SET is_featured = false WHERE id = NEW.property_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_featured_change
AFTER INSERT OR UPDATE ON featured_listings
FOR EACH ROW EXECUTE FUNCTION sync_featured_property();

