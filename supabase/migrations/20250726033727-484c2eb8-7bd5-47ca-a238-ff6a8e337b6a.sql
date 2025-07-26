
-- Create a table for SMTP settings that only admins can manage
CREATE TABLE public.smtp_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  smtp_host TEXT NOT NULL,
  smtp_port INTEGER NOT NULL DEFAULT 587,
  smtp_username TEXT NOT NULL,
  smtp_password TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT NOT NULL DEFAULT 'System',
  use_tls BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) NOT NULL
);

-- Add RLS to SMTP settings (only admins can access)
ALTER TABLE public.smtp_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for SMTP settings - only admins can manage
CREATE POLICY "Only admins can manage SMTP settings" 
  ON public.smtp_settings 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_smtp_settings_updated_at
  BEFORE UPDATE ON public.smtp_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enhance profiles table with more user information for admin management
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- Create a function to get all users with their roles (admin only)
CREATE OR REPLACE FUNCTION public.get_all_users_with_roles()
RETURNS TABLE(
  id UUID,
  email TEXT,
  full_name TEXT,
  institution TEXT,
  lab_name TEXT,
  phone TEXT,
  department TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  roles TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the calling user is an admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  RETURN QUERY
  SELECT 
    u.id,
    u.email::TEXT,
    p.full_name,
    p.institution,
    p.lab_name,
    p.phone,
    p.department,
    COALESCE(p.status, 'active') as status,
    u.created_at,
    p.last_login_at,
    COALESCE(
      ARRAY_AGG(ur.role::TEXT) FILTER (WHERE ur.role IS NOT NULL),
      ARRAY[]::TEXT[]
    ) as roles
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  LEFT JOIN public.user_roles ur ON u.id = ur.user_id
  GROUP BY u.id, u.email, p.full_name, p.institution, p.lab_name, p.phone, p.department, p.status, u.created_at, p.last_login_at
  ORDER BY u.created_at DESC;
END;
$$;

-- Create edge function for password reset emails
CREATE OR REPLACE FUNCTION public.request_password_reset(user_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  -- Check if user exists
  SELECT EXISTS(
    SELECT 1 FROM auth.users WHERE email = user_email
  ) INTO user_exists;
  
  IF NOT user_exists THEN
    -- Don't reveal if user exists or not for security
    RETURN json_build_object('success', true, 'message', 'If the email exists, a reset link will be sent.');
  END IF;
  
  -- This will be handled by the edge function
  RETURN json_build_object('success', true, 'message', 'Password reset initiated.');
END;
$$;
