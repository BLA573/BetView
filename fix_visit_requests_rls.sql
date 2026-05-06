-- ============================================================
-- FIX: visit_requests RLS policies
-- 
-- Root cause: the original policies used
--   WHERE user_id = auth.uid()
-- on the `agencies` table, but that column does not exist.
-- Agency membership is tracked in `agency_members.user_id`.
-- ============================================================

-- Drop the broken policies
DROP POLICY IF EXISTS "Agency can view requests for their properties"  ON public.visit_requests;
DROP POLICY IF EXISTS "Agency can update visit request status"         ON public.visit_requests;

-- Re-create with the correct subquery through agency_members
CREATE POLICY "Agency can view requests for their properties"
ON public.visit_requests FOR SELECT
USING (
  property_id IN (
    SELECT p.id
    FROM public.properties p
    INNER JOIN public.agency_members am ON am.agency_id = p.agency_id
    WHERE am.user_id = auth.uid()
  )
);

CREATE POLICY "Agency can update visit request status"
ON public.visit_requests FOR UPDATE
USING (
  property_id IN (
    SELECT p.id
    FROM public.properties p
    INNER JOIN public.agency_members am ON am.agency_id = p.agency_id
    WHERE am.user_id = auth.uid()
  )
);
