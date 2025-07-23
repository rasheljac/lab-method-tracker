
-- Create enum types for method parameters
CREATE TYPE public.method_type AS ENUM ('positive', 'negative', 'both');
CREATE TYPE public.column_status AS ENUM ('active', 'retired', 'maintenance');
CREATE TYPE public.sample_type AS ENUM ('plasma', 'serum', 'urine', 'tissue', 'other');

-- Create methods table
CREATE TABLE public.methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    ionization_mode method_type NOT NULL,
    flow_rate DECIMAL(5,2), -- mL/min
    column_temperature INTEGER, -- Celsius
    injection_volume DECIMAL(5,2), -- μL
    run_time INTEGER, -- minutes
    mobile_phase_a TEXT,
    mobile_phase_b TEXT,
    gradient_profile TEXT,
    sample_type sample_type,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create columns table
CREATE TABLE public.columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    manufacturer TEXT,
    part_number TEXT,
    dimensions TEXT, -- e.g., "150 x 2.1 mm"
    particle_size TEXT, -- e.g., "1.7 μm"
    stationary_phase TEXT,
    max_pressure INTEGER, -- bar
    max_temperature INTEGER, -- Celsius
    purchase_date DATE,
    first_use_date DATE,
    status column_status DEFAULT 'active',
    total_injections INTEGER DEFAULT 0,
    estimated_lifetime_injections INTEGER DEFAULT 10000,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create metabolites table
CREATE TABLE public.metabolites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    formula TEXT,
    molecular_weight DECIMAL(10,4),
    cas_number TEXT,
    retention_time_range TEXT, -- e.g., "2.5-3.2 min"
    ionization_preference method_type,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create method_metabolites junction table (many-to-many relationship)
CREATE TABLE public.method_metabolites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    method_id UUID REFERENCES public.methods(id) ON DELETE CASCADE NOT NULL,
    metabolite_id UUID REFERENCES public.metabolites(id) ON DELETE CASCADE NOT NULL,
    column_id UUID REFERENCES public.columns(id) ON DELETE CASCADE NOT NULL,
    retention_time DECIMAL(5,2), -- minutes
    peak_area_avg DECIMAL(12,2),
    signal_to_noise DECIMAL(8,2),
    recovery_percent DECIMAL(5,2),
    precision_cv DECIMAL(5,2), -- coefficient of variation
    performance_rating INTEGER CHECK (performance_rating >= 1 AND performance_rating <= 5),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(method_id, metabolite_id, column_id)
);

-- Create injections table to track individual runs
CREATE TABLE public.injections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    method_id UUID REFERENCES public.methods(id) ON DELETE CASCADE NOT NULL,
    column_id UUID REFERENCES public.columns(id) ON DELETE CASCADE NOT NULL,
    injection_number INTEGER NOT NULL,
    injection_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sample_id TEXT,
    pressure_reading INTEGER, -- bar
    temperature_reading INTEGER, -- Celsius
    run_successful BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    lab_name TEXT,
    institution TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metabolites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.method_metabolites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.injections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for methods
CREATE POLICY "Users can view their own methods" ON public.methods
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own methods" ON public.methods
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own methods" ON public.methods
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own methods" ON public.methods
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for columns
CREATE POLICY "Users can view their own columns" ON public.columns
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own columns" ON public.columns
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own columns" ON public.columns
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own columns" ON public.columns
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for metabolites
CREATE POLICY "Users can view their own metabolites" ON public.metabolites
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own metabolites" ON public.metabolites
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own metabolites" ON public.metabolites
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own metabolites" ON public.metabolites
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for method_metabolites
CREATE POLICY "Users can view their own method-metabolite relationships" ON public.method_metabolites
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.methods WHERE methods.id = method_id AND methods.user_id = auth.uid()));
CREATE POLICY "Users can create their own method-metabolite relationships" ON public.method_metabolites
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.methods WHERE methods.id = method_id AND methods.user_id = auth.uid()));
CREATE POLICY "Users can update their own method-metabolite relationships" ON public.method_metabolites
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.methods WHERE methods.id = method_id AND methods.user_id = auth.uid()));
CREATE POLICY "Users can delete their own method-metabolite relationships" ON public.method_metabolites
    FOR DELETE USING (EXISTS (SELECT 1 FROM public.methods WHERE methods.id = method_id AND methods.user_id = auth.uid()));

-- Create RLS policies for injections
CREATE POLICY "Users can view their own injections" ON public.injections
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own injections" ON public.injections
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own injections" ON public.injections
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own injections" ON public.injections
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can create their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create trigger to automatically update column injection counts
CREATE OR REPLACE FUNCTION update_column_injection_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.columns 
    SET total_injections = total_injections + 1,
        updated_at = NOW()
    WHERE id = NEW.column_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_column_injections
    AFTER INSERT ON public.injections
    FOR EACH ROW
    EXECUTE FUNCTION update_column_injection_count();

-- Create trigger to automatically create user profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Create function to get dashboard stats
CREATE OR REPLACE FUNCTION get_dashboard_stats(user_uuid UUID)
RETURNS TABLE (
    total_methods INTEGER,
    total_columns INTEGER,
    total_metabolites INTEGER,
    active_columns INTEGER,
    total_injections BIGINT,
    avg_column_usage DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM public.methods WHERE user_id = user_uuid),
        (SELECT COUNT(*)::INTEGER FROM public.columns WHERE user_id = user_uuid),
        (SELECT COUNT(*)::INTEGER FROM public.metabolites WHERE user_id = user_uuid),
        (SELECT COUNT(*)::INTEGER FROM public.columns WHERE user_id = user_uuid AND status = 'active'),
        (SELECT COUNT(*) FROM public.injections WHERE user_id = user_uuid),
        (SELECT COALESCE(AVG(total_injections::DECIMAL / NULLIF(estimated_lifetime_injections::DECIMAL, 0) * 100), 0)
         FROM public.columns WHERE user_id = user_uuid AND status = 'active');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
