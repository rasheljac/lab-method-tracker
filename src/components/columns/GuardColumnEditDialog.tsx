
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

interface GuardColumn {
  id: string;
  part_number: string;
  batch_number: string | null;
  installed_date: string;
  removed_date: string | null;
  installation_injection_count: number;
  removal_injection_count: number | null;
  notes: string | null;
}

interface GuardColumnEditDialogProps {
  guardColumn: GuardColumn;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const GuardColumnEditDialog = ({
  guardColumn,
  isOpen,
  onClose,
  onSuccess
}: GuardColumnEditDialogProps) => {
  const [formData, setFormData] = useState({
    part_number: guardColumn.part_number,
    batch_number: guardColumn.batch_number || '',
    installed_date: guardColumn.installed_date,
    removed_date: guardColumn.removed_date || '',
    installation_injection_count: guardColumn.installation_injection_count,
    removal_injection_count: guardColumn.removal_injection_count || 0,
    notes: guardColumn.notes || '',
  });
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData: any = {
        part_number: formData.part_number,
        batch_number: formData.batch_number || null,
        installed_date: formData.installed_date,
        installation_injection_count: formData.installation_injection_count,
        notes: formData.notes || null
      };

      if (formData.removed_date) {
        updateData.removed_date = formData.removed_date;
        updateData.removal_injection_count = formData.removal_injection_count;
      }

      const { error } = await supabase
        .from('guard_columns')
        .update(updateData)
        .eq('id', guardColumn.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Guard column updated successfully!',
      });

      onSuccess();
      onClose();
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

  const handleDelete = async () => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from('guard_columns')
        .delete()
        .eq('id', guardColumn.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Guard column deleted successfully!',
      });

      onSuccess();
      onClose();
      setShowDeleteDialog(false);
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
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Guard Column</DialogTitle>
          </DialogHeader>
          
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
              <div>
                <Label htmlFor="removed_date">Removal Date</Label>
                <Input
                  id="removed_date"
                  type="date"
                  value={formData.removed_date}
                  onChange={(e) => setFormData({ ...formData, removed_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="removal_injection_count">Injection Count at Removal</Label>
                <Input
                  id="removal_injection_count"
                  type="number"
                  value={formData.removal_injection_count}
                  onChange={(e) => setFormData({ ...formData, removal_injection_count: parseInt(e.target.value) })}
                  disabled={!formData.removed_date}
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
                placeholder="Any additional notes about the guard column..."
              />
            </div>
          </form>

          <DialogFooter className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Guard Column Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this guard column entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
