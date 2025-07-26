
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SmtpTestDialog } from './SmtpTestDialog';
import { EmailTemplateEditor } from './EmailTemplateEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SmtpSettings {
  id?: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  from_email: string;
  from_name: string;
  use_tls: boolean;
}

export const SmtpSettings = () => {
  const [settings, setSettings] = useState<SmtpSettings>({
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    from_email: '',
    from_name: 'System',
    use_tls: true,
  });
  const [loading, setLoading] = useState(false);
  const [hasExistingSettings, setHasExistingSettings] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSmtpSettings();
  }, []);

  const fetchSmtpSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('smtp_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const smtpData = data[0];
        setSettings({
          id: smtpData.id,
          smtp_host: smtpData.smtp_host,
          smtp_port: smtpData.smtp_port,
          smtp_username: smtpData.smtp_username,
          smtp_password: smtpData.smtp_password,
          from_email: smtpData.from_email,
          from_name: smtpData.from_name,
          use_tls: smtpData.use_tls,
        });
        setHasExistingSettings(true);
      }
    } catch (error) {
      console.error('Error fetching SMTP settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const settingsData = {
        smtp_host: settings.smtp_host,
        smtp_port: settings.smtp_port,
        smtp_username: settings.smtp_username,
        smtp_password: settings.smtp_password,
        from_email: settings.from_email,
        from_name: settings.from_name,
        use_tls: settings.use_tls,
        updated_at: new Date().toISOString(),
      };

      if (hasExistingSettings && settings.id) {
        const { error } = await supabase
          .from('smtp_settings')
          .update(settingsData)
          .eq('id', settings.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('smtp_settings')
          .insert({
            ...settingsData,
            created_by: user.id,
          });
        
        if (error) throw error;
        setHasExistingSettings(true);
      }

      toast({
        title: 'Success',
        description: 'SMTP settings saved successfully',
      });
    } catch (error) {
      console.error('Error saving SMTP settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save SMTP settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tabs defaultValue="settings" className="space-y-4">
      <TabsList>
        <TabsTrigger value="settings">SMTP Settings</TabsTrigger>
        <TabsTrigger value="template">Email Template</TabsTrigger>
      </TabsList>
      
      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>SMTP Settings</CardTitle>
                <CardDescription>
                  Configure email server settings for password reset and notifications
                </CardDescription>
              </div>
              {hasExistingSettings && (
                <SmtpTestDialog smtpSettings={settings} />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input
                  id="smtp-host"
                  type="text"
                  value={settings.smtp_host}
                  onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input
                  id="smtp-port"
                  type="number"
                  value={settings.smtp_port}
                  onChange={(e) => setSettings({ ...settings, smtp_port: parseInt(e.target.value) || 587 })}
                  placeholder="587"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp-username">SMTP Username</Label>
                <Input
                  id="smtp-username"
                  type="text"
                  value={settings.smtp_username}
                  onChange={(e) => setSettings({ ...settings, smtp_username: e.target.value })}
                  placeholder="your-email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp-password">SMTP Password</Label>
                <Input
                  id="smtp-password"
                  type="password"
                  value={settings.smtp_password}
                  onChange={(e) => setSettings({ ...settings, smtp_password: e.target.value })}
                  placeholder="Your app password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="from-email">From Email</Label>
                <Input
                  id="from-email"
                  type="email"
                  value={settings.from_email}
                  onChange={(e) => setSettings({ ...settings, from_email: e.target.value })}
                  placeholder="noreply@yourcompany.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="from-name">From Name</Label>
                <Input
                  id="from-name"
                  type="text"
                  value={settings.from_name}
                  onChange={(e) => setSettings({ ...settings, from_name: e.target.value })}
                  placeholder="System"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="use-tls"
                checked={settings.use_tls}
                onCheckedChange={(checked) => setSettings({ ...settings, use_tls: checked })}
              />
              <Label htmlFor="use-tls">Use TLS Encryption</Label>
            </div>

            <Button onClick={handleSaveSettings} disabled={loading} className="w-full">
              {loading ? 'Saving...' : 'Save SMTP Settings'}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="template">
        <EmailTemplateEditor />
      </TabsContent>
    </Tabs>
  );
};
