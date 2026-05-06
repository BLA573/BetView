-- Create a single entry point for agency self-registration so the frontend
-- does not depend on multiple client-side inserts succeeding under RLS.

ALTER TABLE public.user_roles
  DROP CONSTRAINT IF EXISTS user_roles_role_check;

DROP POLICY IF EXISTS "Users can create own role" ON public.user_roles;
CREATE POLICY "Users can create own role"
  ON public.user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP FUNCTION IF EXISTS public.register_agency_account(TEXT, TEXT, TEXT, TEXT);
CREATE OR REPLACE FUNCTION public.register_agency_account(
  _name TEXT,
  _phone TEXT,
  _license_number TEXT DEFAULT NULL,
  _email TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _agency_id UUID;
  _existing_agency_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF COALESCE(BTRIM(_name), '') = '' THEN
    RAISE EXCEPTION 'Agency name is required';
  END IF;

  IF COALESCE(BTRIM(_phone), '') = '' THEN
    RAISE EXCEPTION 'Agency phone is required';
  END IF;

  SELECT agency_id
  INTO _existing_agency_id
  FROM public.agency_members
  WHERE user_id = auth.uid()
  LIMIT 1;

  IF _existing_agency_id IS NOT NULL THEN
    RETURN _existing_agency_id;
  END IF;

  INSERT INTO public.agencies (
    name,
    email,
    phone,
    license_number,
    status,
    plan_tier
  )
  VALUES (
    BTRIM(_name),
    NULLIF(BTRIM(_email), ''),
    BTRIM(_phone),
    NULLIF(BTRIM(_license_number), ''),
    'pending',
    'basic'
  )
  RETURNING id INTO _agency_id;

  INSERT INTO public.agency_members (user_id, agency_id, role)
  VALUES (auth.uid(), _agency_id, 'owner')
  ON CONFLICT (user_id, agency_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'agency')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN _agency_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_agency_account(TEXT, TEXT, TEXT, TEXT) TO authenticated;
