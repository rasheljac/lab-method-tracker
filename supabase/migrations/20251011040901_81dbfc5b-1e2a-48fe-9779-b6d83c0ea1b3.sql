-- Create column_history table to track column replacements
CREATE TABLE IF NOT EXISTS public.column_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  column_id UUID NOT NULL,
  column_name TEXT NOT NULL,
  manufacturer TEXT,
  part_number TEXT,
  stationary_phase TEXT,
  particle_size TEXT,
  dimensions TEXT,
  max_pressure INTEGER,
  max_temperature INTEGER,
  purchase_date DATE,
  first_use_date DATE,
  replacement_date DATE NOT NULL,
  total_injections_at_replacement INTEGER NOT NULL,
  estimated_lifetime_injections INTEGER,
  replacement_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.column_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for column_history
CREATE POLICY "Users can view their own column history"
  ON public.column_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own column history"
  ON public.column_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own column history"
  ON public.column_history
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own column history"
  ON public.column_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX idx_column_history_column_id ON public.column_history(column_id);
CREATE INDEX idx_column_history_user_id ON public.column_history(user_id);