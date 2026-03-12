ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country text DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS language text DEFAULT 'en';