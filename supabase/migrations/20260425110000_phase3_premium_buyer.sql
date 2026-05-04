-- Phase 3 tables for Premium Buyers

-- Saved Properties
CREATE TABLE saved_properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own saved properties"
    ON saved_properties
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Property Alerts
CREATE TABLE property_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    alert_type TEXT CHECK (alert_type IN ('price_change', 'update')),
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, property_id, alert_type)
);

ALTER TABLE property_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own property alerts"
    ON property_alerts
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Add missing is_featured to properties if not already there
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='properties' AND column_name='is_featured') THEN
        ALTER TABLE properties ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;
END $$;
