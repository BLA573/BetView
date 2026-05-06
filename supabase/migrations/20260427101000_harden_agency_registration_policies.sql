-- Phase 1 hardening: ensure agency self-registration backdoors are closed in every environment.
-- This migration is idempotent and safe to run multiple times.

-- Agencies insert must remain admin-only (self-registration goes through register_agency_account).
DROP POLICY IF EXISTS "Authenticated users can insert agencies" ON public.agencies;
DROP POLICY IF EXISTS "Admins can insert agencies" ON public.agencies;
CREATE POLICY "Admins can insert agencies"
  ON public.agencies FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Prevent direct membership self-inserts; membership is handled by register_agency_account.
DROP POLICY IF EXISTS "Users can create own membership" ON public.agency_members;

-- Prevent direct self-role assignment inserts from the client.
DROP POLICY IF EXISTS "Users can create own role" ON public.user_roles;
