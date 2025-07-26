
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

const maintenanceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  maintenance_type: z.enum(['routine', 'repair', 'calibration', 'cleaning', 'other']),
  maintenance_date: z.date(),
  performed_by: z.string().optional(),
  next_maintenance_date: z.date().optional(),
  cost: z.number().optional(),
  notes: z.string().optional(),
});

type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

interface MaintenanceFormProps {
  maintenance?: any;
  onClose: () => void;
}

export const MaintenanceForm = ({ maintenance, onClose }: MaintenanceFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: maintenance ? {
      title: maintenance.title,
      description: maintenance.description || '',
      maintenance_type: maintenance.maintenance_type,
      maintenance_date: new Date(maintenance.maintenance_date),
      performed_by: maintenance.performed_by || '',
      next_maintenance_date: maintenance.next_maintenance_date ? new Date(maintenance.next_maintenance_date) : undefined,
      cost: maintenance.cost || undefined,
      notes: maintenance.notes || '',
    } : {
      title: '',
      description: '',
      maintenance_type: 'routine',
      maintenance_date: new Date(),
      performed_by: '',
      next_maintenance_date: undefined,
      cost: undefined,
      notes: '',
    },
  });

  const maintenanceDate = watch('maintenance_date');
  const nextMaintenanceDate = watch('next_maintenance_date');

  const onSubmit = async (data: MaintenanceFormData) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const maintenanceData = {
        title: data.title,
        description: data.description || null,
        maintenance_type: data.maintenance_type,
        maintenance_date: data.maintenance_date.toISOString(),
        performed_by: data.performed_by || null,
        next_maintenance_date: data.next_maintenance_date?.toISOString() || null,
        cost: data.cost || null,
        notes: data.notes || null,
        user_id: user.id,
      };

      if (maintenance) {
        const { error } = await supabase
          .from('maintenance_logs')
          .update(maintenanceData)
          .eq('id', maintenance.id);
        
        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Maintenance log updated successfully!',
        });
      } else {
        const { error } = await supabase
          .from('maintenance_logs')
          .insert(maintenanceData);
        
        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Maintenance log created successfully!',
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['maintenance_logs'] });
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Maintenance
        </Button>
        <h2 className="text-2xl font-bold">
          {maintenance ? 'Edit Maintenance Log' : 'Add Maintenance Log'}
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Enter maintenance title"
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="maintenance_type">Type *</Label>
                <Select
                  onValueChange={(value) => setValue('maintenance_type', value as any)}
                  defaultValue={maintenance?.maintenance_type || 'routine'}
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
                {errors.maintenance_type && (
                  <p className="text-sm text-red-500">{errors.maintenance_type.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Enter maintenance description"
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Maintenance Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !maintenanceDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {maintenanceDate ? format(maintenanceDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={maintenanceDate}
                      onSelect={(date) => setValue('maintenance_date', date || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.maintenance_date && (
                  <p className="text-sm text-red-500">{errors.maintenance_date.message}</p>
                )}
              </div>

              <div>
                <Label>Next Maintenance Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !nextMaintenanceDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {nextMaintenanceDate ? format(nextMaintenanceDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={nextMaintenanceDate}
                      onSelect={(date) => setValue('next_maintenance_date', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.next_maintenance_date && (
                  <p className="text-sm text-red-500">{errors.next_maintenance_date.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="performed_by">Performed By</Label>
                <Input
                  id="performed_by"
                  {...register('performed_by')}
                  placeholder="Enter technician name"
                />
                {errors.performed_by && (
                  <p className="text-sm text-red-500">{errors.performed_by.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="cost">Cost</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  {...register('cost', { valueAsNumber: true })}
                  placeholder="Enter cost"
                />
                {errors.cost && (
                  <p className="text-sm text-red-500">{errors.cost.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Additional notes..."
                rows={4}
              />
              {errors.notes && (
                <p className="text-sm text-red-500">{errors.notes.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : maintenance ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
