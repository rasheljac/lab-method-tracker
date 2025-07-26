
-- Create guard_columns table to track guard column changes
CREATE TABLE public.guard_columns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  column_id UUID REFERENCES public.columns NOT NULL,
  part_number TEXT NOT NULL,
  batch_number TEXT,
  installed_date DATE NOT NULL,
  removed_date DATE,
  installation_injection_count INTEGER NOT NULL DEFAULT 0,
  removal_injection_count INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.guard_columns ENABLE ROW LEVEL SECURITY;

-- Create policies for guard_columns
CREATE POLICY "Users can view their own guard columns" 
  ON public.guard_columns 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own guard columns" 
  ON public.guard_columns 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own guard columns" 
  ON public.guard_columns 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own guard columns" 
  ON public.guard_columns 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_guard_columns_updated_at
    BEFORE UPDATE ON public.guard_columns
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
