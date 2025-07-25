
-- Add batch_id column to injections table to group related injections
ALTER TABLE public.injections 
ADD COLUMN batch_id UUID DEFAULT gen_random_uuid();

-- Update existing injections to group them by sample_id and injection_date
UPDATE public.injections 
SET batch_id = (
  SELECT gen_random_uuid() 
  FROM (
    SELECT DISTINCT sample_id, injection_date::date, user_id
    FROM public.injections i2 
    WHERE i2.sample_id = public.injections.sample_id 
    AND i2.injection_date::date = public.injections.injection_date::date
    AND i2.user_id = public.injections.user_id
    LIMIT 1
  ) sub
);

-- Add batch_size column to track how many injections are in each batch
ALTER TABLE public.injections 
ADD COLUMN batch_size INTEGER DEFAULT 1;

-- Update batch_size for existing records
UPDATE public.injections 
SET batch_size = (
  SELECT COUNT(*) 
  FROM public.injections i2 
  WHERE i2.batch_id = public.injections.batch_id
);

-- Create index for better performance on batch queries
CREATE INDEX idx_injections_batch_id ON public.injections(batch_id);
CREATE INDEX idx_injections_user_batch ON public.injections(user_id, batch_id);
