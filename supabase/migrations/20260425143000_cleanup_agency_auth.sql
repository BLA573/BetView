-- Tighten agency registration permissions now that signup flows through
-- register_agency_account().

DROP POLICY IF EXISTS "Authenticated users can insert agencies" ON public.agencies;
DROP POLICY IF EXISTS "Admins can insert agencies" ON public.agencies;
CREATE POLICY "Admins can insert agencies"
  ON public.agencies FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can create own membership" ON public.agency_members;

DROP POLICY IF EXISTS "Users can create own role" ON public.user_roles;
