
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface MaintenanceFormProps {
  maintenance?: any;
  onClose: () => void;
}

export const MaintenanceForm = ({ maintenance, onClose }: MaintenanceFormProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      title: maintenance?.title || '',
      description: maintenance?.description || '',
      maintenance_type: maintenance?.maintenance_type || 'routine',
      maintenance_date: maintenance?.maintenance_date 
        ? new Date(maintenance.maintenance_date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      performed_by: maintenance?.performed_by || '',
      next_maintenance_date: maintenance?.next_maintenance_date 
        ? new Date(maintenance.next_maintenance_date).toISOString().split('T')[0]
        : '',
      cost: maintenance?.cost || '',
      notes: maintenance?.notes || '',
    },
  });

  const maintenanceType = watch('maintenance_type');

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const submitData = {
        ...data,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        cost: data.cost ? parseFloat(data.cost) : null,
        next_maintenance_date: data.next_maintenance_date || null,
        updated_at: new Date().toISOString(),
      };

      if (maintenance) {
        const { error } = await supabase
          .from('maintenance_logs')
          .update(submitData)
          .eq('id', maintenance.id);
        
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Maintenance log updated successfully!',
        });
      } else {
        const { error } = await supabase
          .from('maintenance_logs')
          .insert(submitData);
        
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Maintenance log created successfully!',
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['maintenance-logs'] });
      await queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Maintenance Logs
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {maintenance ? 'Edit Maintenance Log' : 'Add New Maintenance Log'}
          </CardTitle>
          <CardDescription>
            {maintenance 
              ? 'Update the maintenance log details'
              : 'Record maintenance activities for your mass spectrometer'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...register('title', { required: 'Title is required' })}
                  placeholder="e.g., Routine cleaning"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="maintenance_type">Type *</Label>
                <Select
                  value={maintenanceType}
                  onValueChange={(value) => setValue('maintenance_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select maintenance type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine</SelectItem>
                    <SelectItem value="repair">Repair</SelectItem>
                    <SelectItem value="calibration">Calibration</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe the maintenance activity..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maintenance_date">Maintenance Date *</Label>
                <Input
                  id="maintenance_date"
                  type="date"
                  {...register('maintenance_date', { required: 'Maintenance date is required' })}
                />
                {errors.maintenance_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.maintenance_date.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="performed_by">Performed By</Label>
                <Input
                  id="performed_by"
                  {...register('performed_by')}
                  placeholder="Person who performed maintenance"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cost">Cost ($)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  {...register('cost')}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="next_maintenance_date">Next Maintenance Date</Label>
                <Input
                  id="next_maintenance_date"
                  type="date"
                  {...register('next_maintenance_date')}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : maintenance ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
