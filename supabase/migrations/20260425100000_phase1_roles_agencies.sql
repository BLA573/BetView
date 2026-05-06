-- ============================================================
-- Phase 1 Migration: Roles, Agencies, Premium Requests
-- ============================================================

-- 1. Extend app_role enum with new values
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'agency';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'premium_buyer';

-- 2. Allow users to register their initial role
CREATE POLICY "Users can create own role" 
  ON public.user_roles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 3. Agencies table
CREATE TABLE IF NOT EXISTS public.agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  address TEXT DEFAULT '',
  license_number TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'suspended')),
  plan_tier TEXT NOT NULL DEFAULT 'basic'
    CHECK (plan_tier IN ('basic', 'pro', 'enterprise')),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved agencies (public pages)
CREATE POLICY "Anyone can view approved agencies"
  ON public.agencies FOR SELECT
  USING (status = 'approved');

-- Admins can view all agencies
CREATE POLICY "Admins can view all agencies"
  ON public.agencies FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage agencies
CREATE POLICY "Admins can insert agencies"
  ON public.agencies FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update agencies"
  ON public.agencies FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete agencies"
  ON public.agencies FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_agencies_updated_at
  BEFORE UPDATE ON public.agencies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Agency members table (links users to agencies)
CREATE TABLE IF NOT EXISTS public.agency_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner'
    CHECK (role IN ('owner', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, agency_id)
);

ALTER TABLE public.agency_members ENABLE ROW LEVEL SECURITY;

-- Members can see their own membership
CREATE POLICY "Users can view own agency membership"
  ON public.agency_members FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all memberships
CREATE POLICY "Admins can view all agency members"
  ON public.agency_members FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow insert during registration
CREATE POLICY "Users can create own membership"
  ON public.agency_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can manage memberships
CREATE POLICY "Admins can manage agency members"
  ON public.agency_members FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. Add agency_id to properties
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL;

-- 5. Add is_verified to properties
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;

-- 6. Premium requests table
CREATE TABLE IF NOT EXISTS public.premium_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.premium_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own premium requests"
  ON public.premium_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create premium requests"
  ON public.premium_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage premium requests"
  ON public.premium_requests FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 7. Add is_priority to inquiries
ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS is_priority BOOLEAN NOT NULL DEFAULT false;

-- 8. Add is_blocked default if missing
-- (profiles.is_blocked already exists per types.ts)

-- 9. Helper: get user's agency
CREATE OR REPLACE FUNCTION public.get_user_agency_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT agency_id FROM public.agency_members WHERE user_id = _user_id LIMIT 1
$$;

-- 10. Agency members can view their own agency (regardless of status)
CREATE POLICY "Agency members can view own agency"
  ON public.agencies FOR SELECT
  USING (
    id IN (SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid())
  );
