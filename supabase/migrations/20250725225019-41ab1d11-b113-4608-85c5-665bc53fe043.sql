
-- Create maintenance_logs table
CREATE TABLE public.maintenance_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('routine', 'repair', 'calibration', 'cleaning', 'other')),
  maintenance_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  performed_by TEXT,
  next_maintenance_date TIMESTAMP WITH TIME ZONE,
  cost DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own maintenance logs" 
  ON public.maintenance_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own maintenance logs" 
  ON public.maintenance_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own maintenance logs" 
  ON public.maintenance_logs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own maintenance logs" 
  ON public.maintenance_logs 
  FOR DELETE 
  USING (auth.uid() = user_id);
