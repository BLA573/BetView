-- Phase 2 migration for Subscriptions, Scan Requests, and Payment Records

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'basic' CHECK (tier IN ('basic', 'pro', 'enterprise')),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agencies can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (agency_id = (SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid() LIMIT 1));

CREATE POLICY "Admins can manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ETB',
  payment_type TEXT NOT NULL CHECK (payment_type IN ('subscription', 'scan', 'featured')),
  reference TEXT,
  notes TEXT,
  recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agencies can view own payment records"
  ON public.payment_records FOR SELECT
  USING (agency_id = (SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid() LIMIT 1));

CREATE POLICY "Admins can manage payment records"
  ON public.payment_records FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.scan_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  property_type TEXT NOT NULL,
  size_estimate TEXT,
  preferred_date TIMESTAMPTZ,
  contact_person TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled')),
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scan_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agencies can view own scan requests"
  ON public.scan_requests FOR SELECT
  USING (agency_id = (SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid() LIMIT 1));

CREATE POLICY "Agencies can insert scan requests"
  ON public.scan_requests FOR INSERT
  WITH CHECK (agency_id = (SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid() LIMIT 1));

CREATE POLICY "Admins can manage scan requests"
  ON public.scan_requests FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));
