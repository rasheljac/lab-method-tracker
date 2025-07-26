
-- Create email_templates table for storing customizable email templates
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL,
  template_html TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Only admins can manage email templates
CREATE POLICY "Only admins can manage email templates" 
  ON public.email_templates 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger to update updated_at column
CREATE TRIGGER update_email_templates_updated_at 
  BEFORE UPDATE ON public.email_templates 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();
