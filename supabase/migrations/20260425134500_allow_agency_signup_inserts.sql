-- Allow authenticated users to create their own agency row during signup.
-- This keeps admin read access intact while fixing agency self-registration.

DROP POLICY IF EXISTS "Admins can insert agencies" ON public.agencies;

CREATE POLICY "Authenticated users can insert agencies"
  ON public.agencies FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
