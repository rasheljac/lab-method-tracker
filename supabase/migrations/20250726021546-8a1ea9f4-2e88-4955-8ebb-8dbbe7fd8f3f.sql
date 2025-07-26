
-- Add custom fields support to maintenance_logs table
ALTER TABLE maintenance_logs 
ADD COLUMN custom_fields JSONB DEFAULT '{}';

-- Add index for better performance on custom fields queries
CREATE INDEX idx_maintenance_logs_custom_fields ON maintenance_logs USING GIN (custom_fields);

-- Create a table to store custom field definitions for users
CREATE TABLE maintenance_custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'boolean', 'select')),
  field_label TEXT NOT NULL,
  is_required BOOLEAN DEFAULT false,
  select_options TEXT[], -- For select type fields
  field_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, field_name)
);

-- Enable RLS on maintenance_custom_fields
ALTER TABLE maintenance_custom_fields ENABLE ROW LEVEL SECURITY;

-- Create policies for maintenance_custom_fields
CREATE POLICY "Users can manage their own custom fields" ON maintenance_custom_fields
FOR ALL USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for maintenance_custom_fields
CREATE TRIGGER update_maintenance_custom_fields_updated_at 
    BEFORE UPDATE ON maintenance_custom_fields 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
