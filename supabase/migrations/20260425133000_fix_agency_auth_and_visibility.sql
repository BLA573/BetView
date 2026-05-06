-- Align agency schema and policies with the dashboard/auth flows.

ALTER TABLE public.agencies
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'agencies_status_check'
      AND conrelid = 'public.agencies'::regclass
  ) THEN
    ALTER TABLE public.agencies DROP CONSTRAINT agencies_status_check;
  END IF;
END $$;

ALTER TABLE public.agencies
  ADD CONSTRAINT agencies_status_check
  CHECK (status IN ('pending', 'approved', 'suspended', 'rejected'));

DROP POLICY IF EXISTS "Admins can insert agencies" ON public.agencies;
CREATE POLICY "Admins can insert agencies"
  ON public.agencies FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Agency members can update own agency" ON public.agencies;
CREATE POLICY "Agency members can update own agency"
  ON public.agencies FOR UPDATE
  USING (
    id IN (
      SELECT agency_id
      FROM public.agency_members
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    id IN (
      SELECT agency_id
      FROM public.agency_members
      WHERE user_id = auth.uid()
    )
  );
