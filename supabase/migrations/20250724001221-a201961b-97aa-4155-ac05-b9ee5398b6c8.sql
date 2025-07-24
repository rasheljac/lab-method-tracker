
-- Add gradient_steps column to methods table to store gradient information
ALTER TABLE public.methods ADD COLUMN gradient_steps JSONB;

-- Update the methods table to have a comment explaining the gradient_steps structure
COMMENT ON COLUMN public.methods.gradient_steps IS 'Array of gradient steps with time, percent_a, percent_b, and flow_rate';
