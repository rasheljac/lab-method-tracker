import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface ColumnReplacementDialogProps {
  column: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ColumnReplacementDialog = ({ column, open, onOpenChange }: ColumnReplacementDialogProps) => {
  const [formData, setFormData] = useState({
    replacement_date: new Date().toISOString().split('T')[0],
    replacement_reason: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Create history record
      const { error: historyError } = await supabase
        .from('column_history')
        .insert({
          user_id: user.id,
          column_id: column.id,
          column_name: column.name,
          manufacturer: column.manufacturer,
          part_number: column.part_number,
          stationary_phase: column.stationary_phase,
          particle_size: column.particle_size,
          dimensions: column.dimensions,
          max_pressure: column.max_pressure,
          max_temperature: column.max_temperature,
          purchase_date: column.purchase_date,
          first_use_date: column.first_use_date,
          replacement_date: formData.replacement_date,
          total_injections_at_replacement: column.total_injections,
          estimated_lifetime_injections: column.estimated_lifetime_injections,
          replacement_reason: formData.replacement_reason,
          notes: column.notes,
        });

      if (historyError) throw historyError;

      // Reset the column injection count
      const { error: updateError } = await supabase
        .from('columns')
        .update({ 
          total_injections: 0,
          first_use_date: formData.replacement_date,
          updated_at: new Date().toISOString()
        })
        .eq('id', column.id);

      if (updateError) throw updateError;

      await queryClient.invalidateQueries({ queryKey: ['columns'] });
      await queryClient.invalidateQueries({ queryKey: ['column-lifetime'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      await queryClient.invalidateQueries({ queryKey: ['column-history'] });

      toast({
        title: 'Success',
        description: `Column "${column.name}" has been replaced and archived. Injection count reset to 0.`,
      });

      onOpenChange(false);
      setFormData({
        replacement_date: new Date().toISOString().split('T')[0],
        replacement_reason: '',
      });
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Replace Column: {column?.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-medium mb-2">This will:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Archive the current column state ({column?.total_injections} injections)</li>
              <li>Reset the injection count to 0</li>
              <li>Preserve all injection records and history</li>
            </ul>
          </div>

          <div>
            <Label htmlFor="replacement_date">Replacement Date *</Label>
            <Input
              id="replacement_date"
              type="date"
              value={formData.replacement_date}
              onChange={(e) => setFormData({ ...formData, replacement_date: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="replacement_reason">Replacement Reason</Label>
            <Textarea
              id="replacement_reason"
              value={formData.replacement_reason}
              onChange={(e) => setFormData({ ...formData, replacement_reason: e.target.value })}
              placeholder="e.g., High backpressure, degraded performance, scheduled maintenance..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Replace Column'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};