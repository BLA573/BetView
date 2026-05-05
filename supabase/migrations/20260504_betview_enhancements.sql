-- ============================================================
-- BetView Enhancement Migrations
-- ============================================================

-- 1. Visit Requests table
CREATE TABLE IF NOT EXISTS public.visit_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id     uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  name            text NOT NULL,
  phone           text NOT NULL,
  email           text NOT NULL,
  preferred_date  date,
  preferred_time  text,
  message         text,
  status          text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','confirmed','rescheduled','rejected','cancelled')),
  reject_reason   text,
  proposed_date   date,
  proposed_time   text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.visit_requests ENABLE ROW LEVEL SECURITY;

-- Users can insert their own requests
CREATE POLICY "Users can create visit requests"
  ON public.visit_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own requests
CREATE POLICY "Users can view own visit requests"
  ON public.visit_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Agency can view requests for their properties
CREATE POLICY "Agency can view requests for their properties"
  ON public.visit_requests FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM public.properties WHERE agency_id = (
        SELECT id FROM public.agencies WHERE user_id = auth.uid() LIMIT 1
      )
    )
  );

-- Agency can update status of requests for their properties
CREATE POLICY "Agency can update visit request status"
  ON public.visit_requests FOR UPDATE
  USING (
    property_id IN (
      SELECT id FROM public.properties WHERE agency_id = (
        SELECT id FROM public.agencies WHERE user_id = auth.uid() LIMIT 1
      )
    )
  );

-- Admins have full access
CREATE POLICY "Admins full access visit requests"
  ON public.visit_requests FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER visit_requests_updated_at
  BEFORE UPDATE ON public.visit_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Plan Purchase Requests table
CREATE TABLE IF NOT EXISTS public.plan_purchase_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id       uuid REFERENCES public.agencies(id) ON DELETE CASCADE,
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name       text NOT NULL CHECK (plan_name IN ('basic','pro','enterprise')),
  payment_method  text NOT NULL CHECK (payment_method IN ('cbe','telebirr')),
  proof_path      text NOT NULL,
  status          text NOT NULL DEFAULT 'pending_approval'
                    CHECK (status IN ('pending_approval','approved','rejected')),
  reject_reason   text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.plan_purchase_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agency can create plan requests"
  ON public.plan_purchase_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Agency can view own plan requests"
  ON public.plan_purchase_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins full access plan requests"
  ON public.plan_purchase_requests FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE TRIGGER plan_purchase_requests_updated_at
  BEFORE UPDATE ON public.plan_purchase_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Supabase Storage bucket for payment proofs
-- Run via Supabase dashboard or CLI: create bucket 'payment-proofs' (private)

-- 4. Index properties without agency_id for admin flagging
CREATE INDEX IF NOT EXISTS idx_properties_no_agency
  ON public.properties (id) WHERE agency_id IS NULL;
