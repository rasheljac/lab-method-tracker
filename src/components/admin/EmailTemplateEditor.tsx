
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const DEFAULT_TEMPLATE = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #333; margin: 0;">{{subject}}</h1>
  </div>
  
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <p style="margin: 0 0 15px 0; color: #666;">
      {{message_body}}
    </p>
    
    <div style="text-align: center; margin: 25px 0;">
      <a href="{{action_link}}" 
         style="background: #007bff; color: white; padding: 12px 25px; 
                text-decoration: none; border-radius: 5px; font-weight: bold;
                display: inline-block;">
        {{action_text}}
      </a>
    </div>
    
    <p style="margin: 15px 0 0 0; color: #999; font-size: 14px;">
      {{footer_message}}
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px;">
    <p style="color: #999; font-size: 12px; margin: 0;">
      {{company_info}}
    </p>
  </div>
</div>
`;

export const EmailTemplateEditor = () => {
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [loading, setLoading] = useState(false);
  const [hasExistingTemplate, setHasExistingTemplate] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplate();
  }, []);

  const fetchTemplate = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('template_name', 'password_reset')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error && error.code !== 'PGRST116') throw error;

      if (data && data.length > 0) {
        setTemplate(data[0].template_html);
        setHasExistingTemplate(true);
      }
    } catch (error) {
      console.error('Error fetching template:', error);
    }
  };

  const handleSaveTemplate = async () => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const templateData = {
        template_name: 'password_reset',
        template_html: template,
        updated_at: new Date().toISOString(),
      };

      if (hasExistingTemplate) {
        const { error } = await supabase
          .from('email_templates')
          .update(templateData)
          .eq('template_name', 'password_reset');
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('email_templates')
          .insert({
            ...templateData,
            created_by: user.id,
          });
        
        if (error) throw error;
        setHasExistingTemplate(true);
      }

      toast({
        title: 'Success',
        description: 'Email template saved successfully',
      });
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: 'Error',
        description: 'Failed to save email template',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const previewHtml = template
    .replace(/\{\{subject\}\}/g, 'Password Reset Request')
    .replace(/\{\{message_body\}\}/g, 'We received a request to reset your password. Click the button below to create a new password:')
    .replace(/\{\{action_link\}\}/g, '#')
    .replace(/\{\{action_text\}\}/g, 'Reset Password')
    .replace(/\{\{footer_message\}\}/g, 'If you didn\'t request this password reset, you can safely ignore this email. This link will expire in 1 hour.')
    .replace(/\{\{company_info\}\}/g, 'Your Company Name - Secure & Reliable');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Template Editor</CardTitle>
        <CardDescription>
          Customize the HTML template for password reset emails. Use placeholders like {`{{placeholder}}`} for dynamic content.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email-template">HTML Template</Label>
          <Textarea
            id="email-template"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            rows={15}
            className="font-mono text-sm"
            placeholder="Enter your HTML template here..."
          />
          <div className="text-sm text-muted-foreground">
            Available placeholders: {`{{subject}}`}, {`{{message_body}}`}, {`{{action_link}}`}, {`{{action_text}}`}, {`{{footer_message}}`}, {`{{company_info}}`}
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSaveTemplate} disabled={loading} className="gap-2">
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save Template'}
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Email Template Preview</DialogTitle>
              </DialogHeader>
              <div 
                dangerouslySetInnerHTML={{ __html: previewHtml }}
                className="border rounded-lg p-4 bg-white"
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};
