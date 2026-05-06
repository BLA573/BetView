-- Phase 4: non-breaking performance/scalability indexes for frequent filters, joins, and sorts.

CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties (status);
CREATE INDEX IF NOT EXISTS idx_properties_agency_id ON public.properties (agency_id);
CREATE INDEX IF NOT EXISTS idx_properties_tour_url ON public.properties (tour_url);

CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries (status);
CREATE INDEX IF NOT EXISTS idx_inquiries_user_id ON public.inquiries (user_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_property_id ON public.inquiries (property_id);

CREATE INDEX IF NOT EXISTS idx_scan_requests_created_at ON public.scan_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scan_requests_status ON public.scan_requests (status);
CREATE INDEX IF NOT EXISTS idx_scan_requests_agency_id ON public.scan_requests (agency_id);
CREATE INDEX IF NOT EXISTS idx_scan_requests_property_id ON public.scan_requests (property_id);

CREATE INDEX IF NOT EXISTS idx_featured_listings_created_at ON public.featured_listings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_featured_listings_status ON public.featured_listings (status);
CREATE INDEX IF NOT EXISTS idx_featured_listings_agency_id ON public.featured_listings (agency_id);
CREATE INDEX IF NOT EXISTS idx_featured_listings_property_id ON public.featured_listings (property_id);

CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports (status);

CREATE INDEX IF NOT EXISTS idx_premium_requests_created_at ON public.premium_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_premium_requests_status ON public.premium_requests (status);
CREATE INDEX IF NOT EXISTS idx_premium_requests_user_id ON public.premium_requests (user_id);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_admin_id ON public.activity_logs (admin_id);

CREATE INDEX IF NOT EXISTS idx_agencies_created_at ON public.agencies (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agencies_status ON public.agencies (status);

CREATE INDEX IF NOT EXISTS idx_saved_properties_user_id ON public.saved_properties (user_id);
CREATE INDEX IF NOT EXISTS idx_saved_properties_created_at ON public.saved_properties (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_property_alerts_user_id ON public.property_alerts (user_id);
CREATE INDEX IF NOT EXISTS idx_property_alerts_created_at ON public.property_alerts (created_at DESC);
