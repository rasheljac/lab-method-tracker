
-- Add column_id to methods table to link methods to specific columns
ALTER TABLE public.methods 
ADD COLUMN column_id UUID REFERENCES public.columns(id) ON DELETE SET NULL;

-- Add index for better performance on column_id lookups
CREATE INDEX IF NOT EXISTS idx_methods_column_id ON public.methods(column_id);
