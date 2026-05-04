-- Enforce agency ownership for all property listings.

-- 1) Guard against orphan listings before tightening constraints.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.properties p
    WHERE p.agency_id IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot enforce required agency ownership: found properties with NULL agency_id';
  END IF;
END $$;

-- 2) Ensure every listing always references a valid agency.
ALTER TABLE public.properties
  ALTER COLUMN agency_id SET NOT NULL;

-- 3) Replace the FK behavior so deleting an agency cannot orphan listings.
ALTER TABLE public.properties
  DROP CONSTRAINT IF EXISTS properties_agency_id_fkey;

ALTER TABLE public.properties
  ADD CONSTRAINT properties_agency_id_fkey
  FOREIGN KEY (agency_id)
  REFERENCES public.agencies(id)
  ON DELETE RESTRICT;

-- 4) Backend validation: new listings (and agency reassignment) must use approved agencies.
DROP FUNCTION IF EXISTS public.validate_property_agency_owner();
CREATE OR REPLACE FUNCTION public.validate_property_agency_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _agency_status TEXT;
BEGIN
  IF NEW.agency_id IS NULL THEN
    RAISE EXCEPTION 'agency_id is required for property listings';
  END IF;

  IF TG_OP = 'INSERT' OR NEW.agency_id IS DISTINCT FROM OLD.agency_id THEN
    SELECT status INTO _agency_status
    FROM public.agencies
    WHERE id = NEW.agency_id;

    IF _agency_status IS NULL THEN
      RAISE EXCEPTION 'Invalid agency_id: agency does not exist';
    END IF;

    IF _agency_status <> 'approved' THEN
      RAISE EXCEPTION 'Selected agency must be approved before assigning listings';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_property_agency_owner ON public.properties;
CREATE TRIGGER enforce_property_agency_owner
BEFORE INSERT OR UPDATE ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.validate_property_agency_owner();
