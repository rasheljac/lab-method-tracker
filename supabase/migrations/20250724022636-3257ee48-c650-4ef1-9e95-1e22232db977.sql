
-- Add column_id to methods table to link methods to specific columns
ALTER TABLE public.methods 
ADD COLUMN column_id UUID REFERENCES public.columns(id) ON DELETE SET NULL;

-- Add index for better performance on column_id lookups
CREATE INDEX idx_methods_column_id ON public.methods(column_id);

-- Create a junction table for method-metabolite relationships
CREATE TABLE public.method_metabolites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    method_id UUID REFERENCES public.methods(id) ON DELETE CASCADE NOT NULL,
    metabolite_id UUID REFERENCES public.metabolites(id) ON DELETE CASCADE NOT NULL,
    column_id UUID REFERENCES public.columns(id) ON DELETE CASCADE NOT NULL,
    retention_time DECIMAL(6,2), -- Expected retention time for this metabolite with this method/column
    peak_area_avg DECIMAL(12,2), -- Average peak area
    signal_to_noise DECIMAL(8,2), -- Signal to noise ratio
    recovery_percent DECIMAL(5,2), -- Recovery percentage
    precision_cv DECIMAL(5,2), -- Coefficient of variation for precision
    performance_rating INTEGER CHECK (performance_rating >= 1 AND performance_rating <= 5), -- 1-5 rating
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(method_id, metabolite_id, column_id)
);

-- Enable RLS on method_metabolites table
ALTER TABLE public.method_metabolites ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for method_metabolites (users can only access their own data through methods)
CREATE POLICY "Users can view their own method-metabolite relationships"
ON public.method_metabolites
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.methods 
        WHERE methods.id = method_metabolites.method_id 
        AND methods.user_id = auth.uid()
    )
);

CREATE POLICY "Users can create their own method-metabolite relationships"
ON public.method_metabolites
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.methods 
        WHERE methods.id = method_metabolites.method_id 
        AND methods.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update their own method-metabolite relationships"
ON public.method_metabolites
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.methods 
        WHERE methods.id = method_metabolites.method_id 
        AND methods.user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete their own method-metabolite relationships"
ON public.method_metabolites
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.methods 
        WHERE methods.id = method_metabolites.method_id 
        AND methods.user_id = auth.uid()
    )
);

-- Add indexes for better performance
CREATE INDEX idx_method_metabolites_method_id ON public.method_metabolites(method_id);
CREATE INDEX idx_method_metabolites_metabolite_id ON public.method_metabolites(metabolite_id);
CREATE INDEX idx_method_metabolites_column_id ON public.method_metabolites(column_id);

-- Update the column injection count trigger to be more specific
-- (The injections table already has column_id, so this relationship already exists)
