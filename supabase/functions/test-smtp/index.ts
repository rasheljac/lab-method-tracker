
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import nodemailer from 'npm:nodemailer@6.9.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to_email, subject, message, smtp_settings } = await req.json();
    console.log('Test SMTP request received for:', to_email);

    // Validate required fields
    if (!to_email || !smtp_settings) {
      throw new Error('Missing required fields');
    }

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransporter({
      host: smtp_settings.smtp_host,
      port: smtp_settings.smtp_port,
      secure: smtp_settings.smtp_port === 465, // true for 465, false for other ports
      auth: {
        user: smtp_settings.smtp_username,
        pass: smtp_settings.smtp_password,
      },
      tls: smtp_settings.use_tls ? {
        rejectUnauthorized: false
      } : undefined,
    });

    // Send test email
    const mailOptions = {
      from: `"${smtp_settings.from_name}" <${smtp_settings.from_email}>`,
      to: to_email,
      subject: subject || 'SMTP Test Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin: 0;">SMTP Test Successful!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0 0 15px 0; color: #666;">
              ${message || 'This is a test email to verify SMTP configuration.'}
            </p>
            
            <div style="background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <strong>✅ Success!</strong> Your SMTP configuration is working correctly.
            </div>
            
            <p style="margin: 15px 0 0 0; color: #999; font-size: 14px;">
              Test sent at: ${new Date().toLocaleString()}
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              This is an automated test email from your application.
            </p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Test email sent successfully:', result.messageId);

    return new Response(JSON.stringify({
      success: true,
      message: 'Test email sent successfully',
      messageId: result.messageId
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in test SMTP function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to send test email'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
