ALTER TABLE public.platform_settings
ADD COLUMN IF NOT EXISTS dashboard_demo_source TEXT NOT NULL DEFAULT 'auto';

ALTER TABLE public.platform_settings
ADD COLUMN IF NOT EXISTS featured_property_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
      AND table_name = 'platform_settings'
      AND constraint_name = 'platform_settings_featured_property_fkey'
  ) THEN
    ALTER TABLE public.platform_settings
    ADD CONSTRAINT platform_settings_featured_property_fkey
    FOREIGN KEY (featured_property_id)
    REFERENCES public.properties(id)
    ON DELETE SET NULL;
  END IF;
END $$;

UPDATE public.platform_settings
SET dashboard_demo_source = 'auto'
WHERE dashboard_demo_source IS NULL;
