
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import nodemailer from 'npm:nodemailer@6.9.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    console.log('Password reset requested for:', email);

    // Check if user exists (don't reveal if they don't)
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) {
      console.error('Error checking user:', userError);
      throw userError;
    }

    const userExists = userData.users.some(user => user.email === email);
    
    if (!userExists) {
      // Return success to not reveal if user exists
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'If the email exists, a reset link will be sent.' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Get SMTP settings
    const { data: smtpData, error: smtpError } = await supabase
      .from('smtp_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (smtpError || !smtpData || smtpData.length === 0) {
      console.error('SMTP settings not configured');
      throw new Error('Email service not configured');
    }

    const smtpSettings = smtpData[0];

    // Generate password reset link
    const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${Deno.env.get('SUPABASE_URL')}/auth/callback`
      }
    });

    if (resetError) {
      console.error('Error generating reset link:', resetError);
      throw resetError;
    }

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransporter({
      host: smtpSettings.smtp_host,
      port: smtpSettings.smtp_port,
      secure: smtpSettings.smtp_port === 465, // true for 465, false for other ports
      auth: {
        user: smtpSettings.smtp_username,
        pass: smtpSettings.smtp_password,
      },
      tls: smtpSettings.use_tls ? {
        rejectUnauthorized: false
      } : undefined,
    });

    // Send email
    const mailOptions = {
      from: `"${smtpSettings.from_name}" <${smtpSettings.from_email}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin: 0;">Password Reset Request</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0 0 15px 0; color: #666;">
              We received a request to reset your password. Click the button below to create a new password:
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${resetData.properties?.action_link}" 
                 style="background: #007bff; color: white; padding: 12px 25px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold;
                        display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="margin: 15px 0 0 0; color: #999; font-size: 14px;">
              If you didn't request this password reset, you can safely ignore this email.
              This link will expire in 1 hour.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              If the button doesn't work, copy and paste this link into your browser:
              <br>
              <a href="${resetData.properties?.action_link}" style="color: #007bff; word-break: break-all;">
                ${resetData.properties?.action_link}
              </a>
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully');

    return new Response(JSON.stringify({
      success: true,
      message: 'Password reset email sent successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in password reset function:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
