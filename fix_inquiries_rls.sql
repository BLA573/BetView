-- ============================================================
-- FIX: inquiries RLS policies
--
-- Same root cause as visit_requests: any policy that filters
-- through agencies.user_id will silently return nothing because
-- that column does not exist. Agency membership lives in
-- agency_members.user_id.
--
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- Drop any broken agency-side policies on inquiries
DROP POLICY IF EXISTS "Agency can view inquiries for their properties"  ON public.inquiries;
DROP POLICY IF EXISTS "Agency can update inquiries for their properties" ON public.inquiries;
DROP POLICY IF EXISTS "Agency can view their property inquiries"         ON public.inquiries;
DROP POLICY IF EXISTS "Agency can update their property inquiries"       ON public.inquiries;

-- Re-create using agency_members join (same pattern as visit_requests fix)
CREATE POLICY "Agency can view inquiries for their properties"
ON public.inquiries FOR SELECT
USING (
  property_id IN (
    SELECT p.id
    FROM public.properties p
    INNER JOIN public.agency_members am ON am.agency_id = p.agency_id
    WHERE am.user_id = auth.uid()
  )
);

CREATE POLICY "Agency can update inquiries for their properties"
ON public.inquiries FOR UPDATE
USING (
  property_id IN (
    SELECT p.id
    FROM public.properties p
    INNER JOIN public.agency_members am ON am.agency_id = p.agency_id
    WHERE am.user_id = auth.uid()
  )
);
