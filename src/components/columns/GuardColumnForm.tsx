
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

interface GuardColumnFormProps {
  columnId: string;
  columnName: string;
  totalInjections: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const GuardColumnForm = ({ 
  columnId, 
  columnName, 
  totalInjections, 
  onClose, 
  onSuccess 
}: GuardColumnFormProps) => {
  const [formData, setFormData] = useState({
    part_number: '',
    batch_number: '',
    installed_date: new Date().toISOString().split('T')[0],
    installation_injection_count: totalInjections,
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // First, mark any existing guard column as removed
      const { error: updateError } = await supabase
        .from('guard_columns')
        .update({ 
          removed_date: new Date().toISOString(),
          removal_injection_count: totalInjections
        })
        .eq('column_id', columnId)
        .is('removed_date', null);

      if (updateError) throw updateError;

      // Then insert the new guard column
      const { error: insertError } = await supabase
        .from('guard_columns')
        .insert({
          column_id: columnId,
          user_id: user.id,
          part_number: formData.part_number,
          batch_number: formData.batch_number,
          installed_date: formData.installed_date,
          installation_injection_count: formData.installation_injection_count,
          notes: formData.notes,
        });

      if (insertError) throw insertError;

      toast({
        title: 'Success',
        description: 'Guard column change recorded successfully!',
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Guard Column Tracking
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Record Guard Column Change - {columnName}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="part_number">Guard Column Part Number *</Label>
                <Input
                  id="part_number"
                  value={formData.part_number}
                  onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="batch_number">Batch Number</Label>
                <Input
                  id="batch_number"
                  value={formData.batch_number}
                  onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="installed_date">Installation Date *</Label>
                <Input
                  id="installed_date"
                  type="date"
                  value={formData.installed_date}
                  onChange={(e) => setFormData({ ...formData, installed_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="installation_injection_count">Injection Count at Installation</Label>
                <Input
                  id="installation_injection_count"
                  type="number"
                  value={formData.installation_injection_count}
                  onChange={(e) => setFormData({ ...formData, installation_injection_count: parseInt(e.target.value) })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Any additional notes about the guard column change..."
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Recording...' : 'Record Guard Column Change'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
