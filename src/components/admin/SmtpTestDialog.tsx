
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Send } from 'lucide-react';

interface SmtpTestDialogProps {
  smtpSettings: {
    smtp_host: string;
    smtp_port: number;
    smtp_username: string;
    smtp_password: string;
    from_email: string;
    from_name: string;
    use_tls: boolean;
  };
}

export const SmtpTestDialog = ({ smtpSettings }: SmtpTestDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testSubject, setTestSubject] = useState('SMTP Test Email');
  const [testMessage, setTestMessage] = useState('This is a test email to verify SMTP configuration.');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSendTest = async () => {
    if (!testEmail) {
      toast({
        title: 'Error',
        description: 'Please enter a test email address',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-smtp', {
        body: {
          to_email: testEmail,
          subject: testSubject,
          message: testMessage,
          smtp_settings: smtpSettings,
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Test email sent successfully!',
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: 'Error',
        description: 'Failed to send test email. Please check your SMTP settings.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Mail className="h-4 w-4" />
          Test SMTP
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Test SMTP Configuration</DialogTitle>
          <DialogDescription>
            Send a test email to verify your SMTP settings are working correctly.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-email">Test Email Address</Label>
            <Input
              id="test-email"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="test-subject">Subject</Label>
            <Input
              id="test-subject"
              value={testSubject}
              onChange={(e) => setTestSubject(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="test-message">Message</Label>
            <Textarea
              id="test-message"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              rows={3}
            />
          </div>
          
          <Button onClick={handleSendTest} disabled={isSending} className="w-full gap-2">
            <Send className="h-4 w-4" />
            {isSending ? 'Sending...' : 'Send Test Email'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
