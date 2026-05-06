-- Enhance scan request management fields for admin operations.

ALTER TABLE public.scan_requests
  ADD COLUMN IF NOT EXISTS assigned_staff TEXT;

ALTER TABLE public.scan_requests
  ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'normal'
  CHECK (priority IN ('low', 'normal', 'high'));
