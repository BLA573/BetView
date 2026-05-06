-- Visit booking workflow, checkout approvals, and notification logs.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'visit_status'
      AND typnamespace = 'public'::regnamespace
  ) THEN
    CREATE TYPE public.visit_status AS ENUM ('pending', 'confirmed', 'rescheduled', 'rejected', 'cancelled');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.visit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  preferred_datetime TIMESTAMPTZ NOT NULL,
  reschedule_proposed_datetime TIMESTAMPTZ,
  message TEXT,
  consent_to_contact BOOLEAN NOT NULL DEFAULT false,
  status public.visit_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  rejection_note TEXT,
  last_actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT visit_requests_rejection_reason_check CHECK (
    rejection_reason IS NULL OR rejection_reason IN ('already_sold', 'not_available', 'agency_policy', 'other')
  )
);

CREATE TABLE IF NOT EXISTS public.visit_request_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_request_id UUID NOT NULL REFERENCES public.visit_requests(id) ON DELETE CASCADE,
  from_status public.visit_status,
  to_status public.visit_status NOT NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_role TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.visit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_request_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create own visit requests" ON public.visit_requests;
CREATE POLICY "Users can create own visit requests"
  ON public.visit_requests FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND consent_to_contact = true
  );

DROP POLICY IF EXISTS "Users can view own visit requests" ON public.visit_requests;
CREATE POLICY "Users can view own visit requests"
  ON public.visit_requests FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Agencies can view own visit requests" ON public.visit_requests;
CREATE POLICY "Agencies can view own visit requests"
  ON public.visit_requests FOR SELECT
  USING (
    agency_id = (
      SELECT am.agency_id
      FROM public.agency_members am
      WHERE am.user_id = auth.uid()
      LIMIT 1
    )
  );

DROP POLICY IF EXISTS "Agencies can update own visit requests" ON public.visit_requests;
CREATE POLICY "Agencies can update own visit requests"
  ON public.visit_requests FOR UPDATE
  USING (
    agency_id = (
      SELECT am.agency_id
      FROM public.agency_members am
      WHERE am.user_id = auth.uid()
      LIMIT 1
    )
  );

DROP POLICY IF EXISTS "Users can update own visit requests" ON public.visit_requests;
CREATE POLICY "Users can update own visit requests"
  ON public.visit_requests FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage visit requests" ON public.visit_requests;
CREATE POLICY "Admins can manage visit requests"
  ON public.visit_requests FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Participants can read visit audit logs" ON public.visit_request_audit_logs;
CREATE POLICY "Participants can read visit audit logs"
  ON public.visit_request_audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.visit_requests vr
      WHERE vr.id = visit_request_id
        AND (
          vr.user_id = auth.uid()
          OR vr.agency_id = (
            SELECT am.agency_id
            FROM public.agency_members am
            WHERE am.user_id = auth.uid()
            LIMIT 1
          )
          OR public.has_role(auth.uid(), 'admin')
        )
    )
  );

CREATE OR REPLACE FUNCTION public.capture_visit_request_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_role TEXT := 'system';
BEGIN
  IF NEW.last_actor_id IS NOT NULL THEN
    IF public.has_role(NEW.last_actor_id, 'admin') THEN
      actor_role := 'admin';
    ELSIF EXISTS (
      SELECT 1
      FROM public.agency_members am
      WHERE am.user_id = NEW.last_actor_id
        AND am.agency_id = NEW.agency_id
    ) THEN
      actor_role := 'agency';
    ELSIF NEW.user_id = NEW.last_actor_id THEN
      actor_role := 'user';
    END IF;
  END IF;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.visit_request_audit_logs (
      visit_request_id,
      from_status,
      to_status,
      actor_id,
      actor_role,
      reason
    ) VALUES (
      NEW.id,
      NULL,
      NEW.status,
      NEW.last_actor_id,
      actor_role,
      COALESCE(NEW.rejection_reason, NEW.rejection_note)
    );
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.visit_request_audit_logs (
      visit_request_id,
      from_status,
      to_status,
      actor_id,
      actor_role,
      reason
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      NEW.last_actor_id,
      actor_role,
      COALESCE(NEW.rejection_reason, NEW.rejection_note)
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_visit_requests_updated_at ON public.visit_requests;
CREATE TRIGGER update_visit_requests_updated_at
  BEFORE UPDATE ON public.visit_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS capture_visit_request_audit ON public.visit_requests;
CREATE TRIGGER capture_visit_request_audit
  AFTER INSERT OR UPDATE ON public.visit_requests
  FOR EACH ROW EXECUTE FUNCTION public.capture_visit_request_audit();

CREATE TABLE IF NOT EXISTS public.plan_checkout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_tier TEXT NOT NULL CHECK (plan_tier IN ('basic', 'pro', 'enterprise')),
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cbe_bank_transfer', 'telebirr')),
  payment_reference TEXT,
  payment_proof_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'rejected')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.plan_checkout_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Agencies can create own plan checkout requests" ON public.plan_checkout_requests;
CREATE POLICY "Agencies can create own plan checkout requests"
  ON public.plan_checkout_requests FOR INSERT
  WITH CHECK (
    requested_by = auth.uid()
    AND agency_id = (
      SELECT am.agency_id
      FROM public.agency_members am
      WHERE am.user_id = auth.uid()
      LIMIT 1
    )
  );

DROP POLICY IF EXISTS "Agencies can view own plan checkout requests" ON public.plan_checkout_requests;
CREATE POLICY "Agencies can view own plan checkout requests"
  ON public.plan_checkout_requests FOR SELECT
  USING (
    agency_id = (
      SELECT am.agency_id
      FROM public.agency_members am
      WHERE am.user_id = auth.uid()
      LIMIT 1
    )
  );

DROP POLICY IF EXISTS "Admins can manage plan checkout requests" ON public.plan_checkout_requests;
CREATE POLICY "Admins can manage plan checkout requests"
  ON public.plan_checkout_requests FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_plan_checkout_requests_updated_at ON public.plan_checkout_requests;
CREATE TRIGGER update_plan_checkout_requests_updated_at
  BEFORE UPDATE ON public.plan_checkout_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms')),
  recipient TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed')),
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view notification logs" ON public.notification_logs;
CREATE POLICY "Admins can view notification logs"
  ON public.notification_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Service role can write notification logs" ON public.notification_logs;
CREATE POLICY "Service role can write notification logs"
  ON public.notification_logs FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users upload own payment proofs" ON storage.objects;
CREATE POLICY "Users upload own payment proofs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'payment-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users view own payment proofs" ON storage.objects;
CREATE POLICY "Users view own payment proofs"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'payment-proofs'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.has_role(auth.uid(), 'admin')
    )
  );

DROP POLICY IF EXISTS "Admins delete payment proofs" ON storage.objects;
CREATE POLICY "Admins delete payment proofs"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'payment-proofs'
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_visit_requests_property_id ON public.visit_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_visit_requests_user_id ON public.visit_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_visit_requests_agency_id ON public.visit_requests(agency_id);
CREATE INDEX IF NOT EXISTS idx_visit_requests_status ON public.visit_requests(status);
CREATE INDEX IF NOT EXISTS idx_visit_request_audit_visit_request_id ON public.visit_request_audit_logs(visit_request_id);
CREATE INDEX IF NOT EXISTS idx_plan_checkout_requests_agency_id ON public.plan_checkout_requests(agency_id);
CREATE INDEX IF NOT EXISTS idx_plan_checkout_requests_status ON public.plan_checkout_requests(status);

ALTER TABLE public.premium_requests
  ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('cbe_bank_transfer', 'telebirr'));

ALTER TABLE public.premium_requests
  ADD COLUMN IF NOT EXISTS payment_reference TEXT;
