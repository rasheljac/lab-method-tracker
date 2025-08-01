
-- Add expected_lifetime_injections column to guard_columns table
ALTER TABLE public.guard_columns 
ADD COLUMN expected_lifetime_injections integer;
